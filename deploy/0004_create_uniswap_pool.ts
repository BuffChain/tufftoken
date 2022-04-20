// SPDX-License-Identifier: agpl-3.0

import hre from 'hardhat';
import {ethers, Contract, Signer, BigNumber, BigNumberish} from "ethers";

import {Pool, Position, NonfungiblePositionManager as ANonfungiblePositionManager, nearestUsableTick} from '@uniswap/v3-sdk';
import {Percent, Token} from "@uniswap/sdk-core";
import { getERC721EnumerableContract } from '../utils/test_utils';
import {abi as NonfungiblePositionManagerABI} from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json';
import { NonfungiblePositionManager } from '../src/types';
import {Address} from "hardhat-deploy/dist/types";
import { TOKEN_TOTAL_SUPPLY } from '../utils/consts';

const {consts, UNISWAP_POOL_BASE_FEE} = require("../utils/consts");
const {logDeploymentTx} = require("../utils/deployment_helpers");
const {getSqrtPriceX96, getWETH9Contract, runCallbackImpersonatingAcct} = require("../utils/test_utils");

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

async function createPool(uniswapV3Factory: Contract, tuffTokenDiamond: Contract) {
    let tuffTokenPoolAddr = await uniswapV3Factory.getPool(consts("WETH9_ADDR"), tuffTokenDiamond.address, UNISWAP_POOL_BASE_FEE);
    if (!tuffTokenPoolAddr || tuffTokenPoolAddr === hre.ethers.constants.AddressZero) {
        console.log(`TuffToken pool not found, creating one now...`);

        let createPoolTx = await uniswapV3Factory.createPool(consts("WETH9_ADDR"), tuffTokenDiamond.address, UNISWAP_POOL_BASE_FEE);
        logDeploymentTx("Created pool:", createPoolTx);

        tuffTokenPoolAddr = await uniswapV3Factory.getPool(consts("WETH9_ADDR"), tuffTokenDiamond.address, UNISWAP_POOL_BASE_FEE);
    }
    console.log(`TuffToken pool address [${tuffTokenPoolAddr}]`);

    const uniswapV3Pool = await hre.ethers.getContractAt("UniswapV3Pool", tuffTokenPoolAddr);

    const price = consts("TUFF_STARTING_PRICE");
    const tuffTokenSqrtPriceX96 = getSqrtPriceX96(price);

    console.log(`Initializing TuffToken pool. Price: ${price} ETH. sqrtPriceX96: ${tuffTokenSqrtPriceX96}`);
    await uniswapV3Pool.initialize(tuffTokenSqrtPriceX96);

    return uniswapV3Pool;
}

async function addLiquidityToPool(poolContract: Contract, tuffTokenDiamond: Contract, buffChain: Address) {
    const immutables = await getPoolImmutables(poolContract);
    const state = await getPoolState(poolContract);

    const WETH9 = new Token(1, immutables.token0, 18, "WETH9", "Wrapped Ethereum");
    const TUFF = new Token(1, immutables.token1, 9, "TUFF", "Tuff Token");
    const block = await hre.ethers.provider.getBlock("latest");
    const deadline = block.timestamp + 200;

    //BuffChain's cut is 15% of total minted supply, we then provide half of that as liquidity
    //TODO: do we also want to use TuffDAO treasury? That would _likely_ be another deployment script
    const buffChainsLiquidityCut = Math.floor((TOKEN_TOTAL_SUPPLY * 0.15) / 2);
    console.log(`BuffChain is providing ${buffChainsLiquidityCut} TUFF`);

    const tuffLiquidity = hre.ethers.utils.parseUnits("1", 9);
    const wethLiquidity = hre.ethers.utils.parseEther("1");
    console.log("-----STARTING BALANCES-----");
    await printBuffChainBal(tuffTokenDiamond, buffChain);

    const WETH9_TUFF_POOL = new Pool(
        WETH9,
        TUFF,
        immutables.fee,
        state.sqrtPriceX96.toString(),
        state.liquidity.toString(),
        state.tick
    );

    console.log(`Current pool liquidity [${state.liquidity.toString()}]`);
    const position = new Position({
        pool: WETH9_TUFF_POOL,
        liquidity: tuffLiquidity.toString(),
        tickLower: nearestUsableTick(state.tick, immutables.tickSpacing) - immutables.tickSpacing  * 2,
        tickUpper: nearestUsableTick(state.tick, immutables.tickSpacing) + immutables.tickSpacing * 2
    });

    const nonfungiblePositionManager = await hre.ethers.getContractAt(
      NonfungiblePositionManagerABI, consts("UNISWAP_V3_NonfungiblePositionManager_ADDR")) as NonfungiblePositionManager;

    const buffChainAcct = await hre.ethers.getSigner(buffChain);
    await runCallbackImpersonatingAcct(buffChainAcct, async (acct: Signer) => {
        const acctAddr = await acct.getAddress();
        const weth9Contract = await getWETH9Contract();
        await weth9Contract.connect(acct).approve(consts("UNISWAP_V3_NonfungiblePositionManager_ADDR"), hre.ethers.utils.parseEther("10").toString());
        await tuffTokenDiamond.connect(acct).approve(consts("UNISWAP_V3_NonfungiblePositionManager_ADDR"), tuffLiquidity);

        //Mint position
        const mintResp = await nonfungiblePositionManager.mint(
          {
              token0: immutables.token0,
              token1: immutables.token1,
              fee: immutables.fee,
              tickLower: nearestUsableTick(state.tick, immutables.tickSpacing) - immutables.tickSpacing  * 2,
              tickUpper: nearestUsableTick(state.tick, immutables.tickSpacing) + immutables.tickSpacing * 2,
              amount0Desired: wethLiquidity,
              amount1Desired: tuffLiquidity,
              amount0Min: 0,
              amount1Min: 0,
              recipient: acctAddr,
              deadline: deadline
          }
        );

        const mintParams = await ANonfungiblePositionManager.addCallParameters(position, {
            slippageTolerance: new Percent(50, 10_000),
            recipient: await acct.getAddress(),
            deadline: deadline
        });

        // const gasPriceInGwei = 500;
        // const mintTx = {
        //     data: mintParams.calldata,
        //     to: consts("UNISWAP_V3_NonfungiblePositionManager_ADDR"),
        //     value: BigNumber.from(mintParams.value),
        //     from: await acct.getAddress(),
        //     gasPrice: BigNumber.from(gasPriceInGwei * Math.pow(10, 9)),
        // };
        //
        // await acct.sendTransaction(mintTx);
        console.log(mintResp);
        console.log("Mint liquidity nft position was successful");

        const liquidityPosNFT = await getERC721EnumerableContract();
        const tokenId = liquidityPosNFT.tokenOfOwnerByIndex(await acct.getAddress(), 0);
        console.log(`tokenId [${tokenId}]`);

        //Add liquidity to position
        const liquidityTx = await ANonfungiblePositionManager.addCallParameters(position, {
            slippageTolerance: new Percent(50, 10_000),
            deadline: deadline,
            tokenId: tokenId
        });
        const decodedLiquidityTx = ANonfungiblePositionManager.INTERFACE.parseTransaction({data: liquidityTx.calldata, value: liquidityTx.value});
        console.log(`decodedLiquidityTx.name [${decodedLiquidityTx.name}]`);
        console.log(`decodedLiquidityTx.args [${decodedLiquidityTx.args}]`);
        console.log(`decodedLiquidityTx.value [${decodedLiquidityTx.value}]`);
    });

    console.log("-----ENDING BALANCES-----");
    await printBuffChainBal(tuffTokenDiamond, buffChain);

    // await tuffTokenDiamond.approve(uniswapV3Pool.address, hre.ethers.constants.MaxUint256);
    // await (await getWETH9Contract()).approve(uniswapV3Pool.address, hre.ethers.constants.MaxUint256);
    // await uniswapV3Pool.mint(tuffTokenDiamond.address, -130000, -100000, hre.ethers.utils.parseEther("1"), []);
}

async function printBuffChainBal(tuffTokenDiamond: Contract, buffChain: Address) {
    console.log(`[${buffChain}] has [${hre.ethers.utils.formatEther(
      await hre.ethers.provider.getBalance(buffChain))}] ETH`);

    console.log(`[${buffChain}] has [${hre.ethers.utils.formatEther(
      await (await getWETH9Contract()).balanceOf(buffChain))}] WETH`);

    console.log(`[${buffChain}] has [${hre.ethers.utils.formatEther(
      await tuffTokenDiamond.balanceOf(buffChain))}] TUFF`);
}

module.exports = async () => {
    console.log("[DEPLOY][v0004] - Creating Uniswap pool and providing liquidity");

    const {deployments, getNamedAccounts} = hre;
    const {contractOwner, buffChain} = await getNamedAccounts();

    const TuffTokenDiamond = await deployments.get("TuffTokenDiamond");
    // @ts-ignore
    const tuffTokenDiamond = await hre.ethers.getContractAt(TuffTokenDiamond.abi, TuffTokenDiamond.address, contractOwner);
    const uniswapV3Factory = await hre.ethers.getContractAt("UniswapV3Factory", consts("UNISWAP_V3_FACTORY_ADDR"));

    const uniswapV3Pool = await createPool(uniswapV3Factory, tuffTokenDiamond);
    await addLiquidityToPool(uniswapV3Pool, tuffTokenDiamond, buffChain);
};

module.exports.tags = ['v0004'];
