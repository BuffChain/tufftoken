// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";
import { ethers, Contract } from "ethers";
import { nearestUsableTick } from "@uniswap/v3-sdk";
import {
    abi as NonfungiblePositionManagerABI
} from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import { Address } from "hardhat-deploy/dist/types";
import { NonfungiblePositionManager, IUniswapV3Pool, IUniswapV3Factory, TuffVBT } from "../src/types";

import {
    consts,
    BUFFCHAIN_INIT_TUFF_LIQUIDITY_PERCENTAGE,
    BUFFCHAIN_INIT_WETH_LIQUIDITY_WETH, TOKEN_DECIMALS,
    TOKEN_SYMBOL, UNISWAP_POOL_BASE_FEE,
    UNISWAP_POOL_OBSERVATION_CARDINALITY
} from "../utils/consts";
import { getSqrtPriceX96, getWETH9Contract, getAcctBal } from "../utils/utils";
import { log } from "../utils/deployment_helpers";

module.exports.tags = ["v0005", "test"];
module.exports = async () => {
    log(`Creating Uniswap pool and providing liquidity for ${TOKEN_SYMBOL}`);

    const { deployments, getNamedAccounts } = hre;
    const { contractOwner, buffChain } = await getNamedAccounts();
    const contractOwnerAcct = await hre.ethers.getSigner(contractOwner);

    const tuffDUUDeployment = await deployments.get(TOKEN_SYMBOL);
    const tuffDUU = await hre.ethers.getContractAt(
        tuffDUUDeployment.abi, tuffDUUDeployment.address, contractOwnerAcct) as TuffVBT;

    const uniswapV3Factory = await hre.ethers.getContractAt(
        "UniswapV3Factory", consts("UNISWAP_V3_FACTORY_ADDR")) as IUniswapV3Factory;

    const uniswapV3Pool = await createPool(uniswapV3Factory, tuffDUU);
    await addLiquidityToPool(uniswapV3Pool, tuffDUU, buffChain);
};

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
        maxLiquidityPerTick: await poolContract.maxLiquidityPerTick()
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
        unlocked: slot[6]
    };
    return PoolState;
}

async function createPool(uniswapV3Factory: IUniswapV3Factory, tuffDUU: TuffVBT) {
    let tuffDUUPoolAddr = await uniswapV3Factory.getPool(consts("WETH9_ADDR"), tuffDUU.address, UNISWAP_POOL_BASE_FEE);
    if (!tuffDUUPoolAddr || tuffDUUPoolAddr === hre.ethers.constants.AddressZero) {
        log(`${TOKEN_SYMBOL} pool not found, creating one now...`);

        let createPoolTx = await uniswapV3Factory.createPool(consts("WETH9_ADDR"), tuffDUU.address, UNISWAP_POOL_BASE_FEE);
        log("Created pool: " + createPoolTx);

        tuffDUUPoolAddr = await uniswapV3Factory.getPool(consts("WETH9_ADDR"), tuffDUU.address, UNISWAP_POOL_BASE_FEE);
    }
    log(`${TOKEN_SYMBOL} Uniswap pool address [${tuffDUUPoolAddr}]`);

    const tuffDUUUniswapPool = await hre.ethers.getContractAt("UniswapV3Pool", tuffDUUPoolAddr) as IUniswapV3Pool;

    const price = consts("TUFF_STARTING_PRICE");
    const tuffDUUSqrtPriceX96 = getSqrtPriceX96(price);

    log(`Initializing ${TOKEN_SYMBOL} pool. Target price: ${price} ETH`);
    await tuffDUUUniswapPool.initialize(tuffDUUSqrtPriceX96);

    log(`Setting the amount of observations the pool will track to [${UNISWAP_POOL_OBSERVATION_CARDINALITY}]`);
    await tuffDUUUniswapPool.increaseObservationCardinalityNext(UNISWAP_POOL_OBSERVATION_CARDINALITY);

    log(`Excluding ${TOKEN_SYMBOL} Uniswap pool from fees`);
    await tuffDUU.excludeFromFee(tuffDUUUniswapPool.address);

    return tuffDUUUniswapPool;
}

async function addLiquidityToPool(poolContract: IUniswapV3Pool, tuffDUU: TuffVBT, buffChain: Address) {
    const immutables = await getPoolImmutables(poolContract);
    const state = await getPoolState(poolContract);

    const nonfungiblePositionManager = await hre.ethers.getContractAt(
        NonfungiblePositionManagerABI, consts("UNISWAP_V3_NONFUNGIBLEPOSITIONMANAGER_ADDR")
    ) as NonfungiblePositionManager;

    const buffChainAcct = await hre.ethers.getSigner(buffChain);
    const weth9Contract = await getWETH9Contract();

    //Use a portion of BuffChain's TUFF tokens as liquidity
    log("-----STARTING BALANCES-----");
    const { tuffBal } = await getAcctBal(tuffDUU, buffChain, "[DEPLOY][v0005] - ");
    const buffChainsTuffLiquidity = tuffBal.mul(BUFFCHAIN_INIT_TUFF_LIQUIDITY_PERCENTAGE).div(100);
    const buffChainsWethLiquidity = BUFFCHAIN_INIT_WETH_LIQUIDITY_WETH;

    await tuffDUU.connect(buffChainAcct).approve(nonfungiblePositionManager.address, buffChainsTuffLiquidity);
    await weth9Contract.connect(buffChainAcct).approve(nonfungiblePositionManager.address, buffChainsWethLiquidity);

    const block = await hre.ethers.provider.getBlock("latest");
    const deadline = block.timestamp + 60 * 20; //20 minutes from the latest block;

    log(`Minting WETH9/TUFF liquidity position for [${buffChain}]`);
    const mintTx = await nonfungiblePositionManager.connect(buffChainAcct).mint(
        {
            token0: immutables.token0,
            token1: immutables.token1,
            fee: immutables.fee,
            tickLower: nearestUsableTick(state.tick, immutables.tickSpacing) - immutables.tickSpacing * 2,
            tickUpper: nearestUsableTick(state.tick, immutables.tickSpacing) + immutables.tickSpacing * 2,
            amount0Desired: buffChainsTuffLiquidity,
            amount1Desired: buffChainsWethLiquidity,
            amount0Min: 1,
            amount1Min: buffChainsWethLiquidity.sub(buffChainsWethLiquidity.div(10)), //Allow 10% slippage
            recipient: buffChain,
            deadline: deadline
        }
    );

    const mintReceipt = await mintTx.wait();
    if (mintReceipt?.events) {
        const increaseLiquidityEvent = mintReceipt.events.find(event => event.event === "IncreaseLiquidity");
        const amount0 = increaseLiquidityEvent?.args?.amount0.toString();
        const amount1 = increaseLiquidityEvent?.args?.amount1.toString();
        log(`Provided ${hre.ethers.utils.formatUnits(amount0, TOKEN_DECIMALS)} ${TOKEN_SYMBOL}`);
        log(`Provided ${hre.ethers.utils.formatEther(amount1)} WETH`);

        // const tokenId = await nonfungiblePositionManager.tokenOfOwnerByIndex(buffChain, 0);
    } else {
        throw new Error(`Did not provide any liquidity for ${TOKEN_SYMBOL}/WETH. Exiting...`);
    }

    log("-----ENDING BALANCES-----");
    await getAcctBal(tuffDUU, buffChain, "[DEPLOY][v0005] - ");
}
