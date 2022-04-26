// SPDX-License-Identifier: agpl-3.0

import hre from 'hardhat';
import {ethers, Contract, BigNumber} from "ethers";

import {nearestUsableTick} from '@uniswap/v3-sdk';
import {
    abi as NonfungiblePositionManagerABI
} from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json';
import {NonfungiblePositionManager, TuffToken} from '../src/types';
import {Address} from "hardhat-deploy/dist/types";
import {BUFFCHAIN_INIT_LIQUIDITY_PERCENTAGE} from '../utils/consts';
import {IUniswapV3Factory} from "@uniswap/v3-periphery/typechain/IUniswapV3Factory";
import {IUniswapV3Pool} from "@uniswap/v3-periphery/typechain/IUniswapV3Pool";

const {consts, UNISWAP_POOL_BASE_FEE} = require("../utils/consts");
const {logDeploymentTx} = require("../utils/deployment_helpers");

//TODO: No test utils in dpeloyments
const {getSqrtPriceX96, getWETH9Contract} = require("../utils/test_utils");

interface Immutables {
    factory: string;
    token0: string;
    token1: string;
    fee: number;
    tickSpacing: number;
    maxLiquidityPerTick: ethers.BigNumber;
}

interface State {
    liquidity: ethers.BigNumber;
    sqrtPriceX96: ethers.BigNumber;
    tick: number;
    observationIndex: number;
    observationCardinality: number;
    observationCardinalityNext: number;
    feeProtocol: number;
    unlocked: boolean;
}

async function getPoolImmutables(poolContract: Contract) {
    const immutables: Immutables = {
        factory: await poolContract.factory(),
        token0: await poolContract.token0(),
        token1: await poolContract.token1(),
        fee: await poolContract.fee(),
        tickSpacing: await poolContract.tickSpacing(),
        maxLiquidityPerTick: await poolContract.maxLiquidityPerTick(),
    };
    return immutables;
}

async function getPoolState(poolContract: Contract) {
    const slot = await poolContract.slot0();
    const PoolState: State = {
        liquidity: await poolContract.liquidity(),
        sqrtPriceX96: slot[0],
        tick: slot[1],
        observationIndex: slot[2],
        observationCardinality: slot[3],
        observationCardinalityNext: slot[4],
        feeProtocol: slot[5],
        unlocked: slot[6],
    };
    return PoolState;
}

async function createPool(uniswapV3Factory: IUniswapV3Factory, tuffTokenDiamond: TuffToken) {
    let tuffTokenPoolAddr = await uniswapV3Factory.getPool(consts("WETH9_ADDR"), tuffTokenDiamond.address, UNISWAP_POOL_BASE_FEE);
    if (!tuffTokenPoolAddr || tuffTokenPoolAddr === hre.ethers.constants.AddressZero) {
        console.log(`TuffToken pool not found, creating one now...`);

        let createPoolTx = await uniswapV3Factory.createPool(consts("WETH9_ADDR"), tuffTokenDiamond.address, UNISWAP_POOL_BASE_FEE);
        logDeploymentTx("Created pool:", createPoolTx);

        tuffTokenPoolAddr = await uniswapV3Factory.getPool(consts("WETH9_ADDR"), tuffTokenDiamond.address, UNISWAP_POOL_BASE_FEE);
    }
    console.log(`TuffToken pool address [${tuffTokenPoolAddr}]`);

    const uniswapV3Pool = await hre.ethers.getContractAt("UniswapV3Pool", tuffTokenPoolAddr) as IUniswapV3Pool;

    const price = consts("TUFF_STARTING_PRICE");
    const tuffTokenSqrtPriceX96 = getSqrtPriceX96(price);

    console.log(`Initializing TuffToken pool. Price: ${price} ETH. sqrtPriceX96: ${tuffTokenSqrtPriceX96}`);
    await uniswapV3Pool.initialize(tuffTokenSqrtPriceX96);

    console.log(`Excluding TuffToken Uniswap pool from fees`);
    await tuffTokenDiamond.excludeFromFee(uniswapV3Pool.address);

    return uniswapV3Pool;
}

async function addLiquidityToPool(poolContract: IUniswapV3Pool, tuffTokenDiamond: TuffToken, buffChain: Address) {
    const immutables = await getPoolImmutables(poolContract);
    const state = await getPoolState(poolContract);

    const nonfungiblePositionManager = await hre.ethers.getContractAt(
        NonfungiblePositionManagerABI, consts("UNISWAP_V3_NonfungiblePositionManager_ADDR")
    ) as NonfungiblePositionManager;

    const buffChainAcct = await hre.ethers.getSigner(buffChain);
    const weth9Contract = await getWETH9Contract();

    //Use a portion of BuffChain's TUFF tokens as liquidity
    //TODO: do we also want to use TuffDAO treasury? That would _likely_ be another deployment script
    console.log("-----STARTING BALANCES-----");
    const {tuffBal} = await printBuffChainBal(tuffTokenDiamond, buffChain);
    const buffChainsTuffLiquidity = tuffBal.mul(BUFFCHAIN_INIT_LIQUIDITY_PERCENTAGE).div(100);
    //TODO: no magic number
    const buffChainsWethLiquidity = hre.ethers.utils.parseEther("10");

    await tuffTokenDiamond.connect(buffChainAcct).approve(nonfungiblePositionManager.address, buffChainsTuffLiquidity);
    await weth9Contract.connect(buffChainAcct).approve(nonfungiblePositionManager.address, buffChainsWethLiquidity);

    const block = await hre.ethers.provider.getBlock("latest");
    //TODO: No magic number
    const deadline = block.timestamp + 200;

    await nonfungiblePositionManager.connect(buffChainAcct).mint(
        {
            token0: immutables.token0,
            token1: immutables.token1,
            fee: immutables.fee,
            tickLower: nearestUsableTick(state.tick, immutables.tickSpacing) - immutables.tickSpacing * 2,
            tickUpper: nearestUsableTick(state.tick, immutables.tickSpacing) + immutables.tickSpacing * 2,
            amount0Desired: buffChainsTuffLiquidity,
            amount1Desired: buffChainsWethLiquidity,
            amount0Min: 0,
            amount1Min: 0,
            recipient: buffChain,
            deadline: deadline
        }
    );

    const tokenId = await nonfungiblePositionManager.tokenOfOwnerByIndex(buffChain, 0);

    console.log("-----ENDING BALANCES-----");
    await printBuffChainBal(tuffTokenDiamond, buffChain);
}

async function printBuffChainBal(tuffTokenDiamond: Contract, buffChain: Address) {
    const ethBal = BigNumber.from(await hre.ethers.provider.getBalance(buffChain));
    console.log(`[${buffChain}] has [${hre.ethers.utils.formatEther(ethBal)}] ETH`);

    const wethBal = BigNumber.from(await (await getWETH9Contract()).balanceOf(buffChain));
    console.log(`[${buffChain}] has [${hre.ethers.utils.formatEther(wethBal)}] WETH`);

    const tuffBal = BigNumber.from(await tuffTokenDiamond.balanceOf(buffChain));
    console.log(`[${buffChain}] has [${tuffBal.toString()}] TUFF`);

    return {ethBal, wethBal, tuffBal};
}

module.exports = async () => {
    console.log("[DEPLOY][v0004] - Creating Uniswap pool and providing liquidity");

    const {deployments, getNamedAccounts} = hre;
    const {contractOwner, buffChain} = await getNamedAccounts();
    const contractOwnerAcct = await hre.ethers.getSigner(contractOwner);

    const TuffTokenDiamond = await deployments.get("TuffTokenDiamond");
    const tuffTokenDiamond = await hre.ethers.getContractAt(
        TuffTokenDiamond.abi, TuffTokenDiamond.address, contractOwnerAcct) as TuffToken;

    const uniswapV3Factory = await hre.ethers.getContractAt(
        "UniswapV3Factory", consts("UNISWAP_V3_FACTORY_ADDR")) as IUniswapV3Factory;

    const uniswapV3Pool = await createPool(uniswapV3Factory, tuffTokenDiamond);
    await addLiquidityToPool(uniswapV3Pool, tuffTokenDiamond, buffChain);
};

module.exports.tags = ['v0004'];
