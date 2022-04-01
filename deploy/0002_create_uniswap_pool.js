// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");

const {Pool, Position, NonfungiblePositionManager, nearestUsableTick} = require('@uniswap/v3-sdk');
const {Percent, Token} = require("@uniswap/sdk-core");

const {consts, UNISWAP_POOL_BASE_FEE} = require("../utils/consts");
const {logDeploymentTx} = require("../utils/deployment_helpers");
const {getSqrtPriceX96, getWETH9Contract} = require("../utils/test_utils");

interface Immutables {
    factory: string;
    token0: string;
    token1: string;
    fee: number;
    tickSpacing: number;
    maxLiquidityPerTick: hre.ethers.BigNumber;
}

interface State {
    liquidity: hre.ethers.BigNumber;
    sqrtPriceX96: hre.ethers.BigNumber;
    tick: number;
    observationIndex: number;
    observationCardinality: number;
    observationCardinalityNext: number;
    feeProtocol: number;
    unlocked: boolean;
}

async function getPoolImmutables(poolContract) {
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

async function getPoolState(poolContract) {
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

async function createPool(uniswapV3Factory, tuffTokenDiamond) {
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

async function addLiquidityToPool(poolContract, tuffTokenDiamond) {
    const immutables = await getPoolImmutables(poolContract);
    const state = await getPoolState(poolContract);

    const WETH9 = new Token(1, immutables.token0, 18, "WETH9", "Wrapped Ethereum");
    const TUFF = new Token(1, immutables.token1, 18, "TUFF", "Tuff Token");
    const block = await hre.ethers.provider.getBlock("latest");
    const deadline = block.timestamp + 200;

    const tuffBalance = hre.ethers.utils.parseEther("1");
    const wethBalance = hre.ethers.utils.parseEther("1");

    const WETH9_TUFF_POOL = new Pool(
        WETH9,
        TUFF,
        immutables.fee,
        state.sqrtPriceX96.toString(),
        state.liquidity.toString(),
        state.tick
    );

    console.log(`current pool liquidity [${state.liquidity.toString()}]`);
    const position = new Position({
        pool: WETH9_TUFF_POOL,
        liquidity: state.liquidity.div(5000).toString(),
        tickLower: nearestUsableTick(state.tick, immutables.tickSpacing) - immutables.tickSpacing  * 2,
        tickUpper: nearestUsableTick(state.tick, immutables.tickSpacing) + immutables.tickSpacing * 2
    });

    //Mint position
    const {mintCallData, mintValue} = NonfungiblePositionManager.addCallParameters(position, {
        slippageTolerance: new Percent(50, 10_000),
        recipient: tuffTokenDiamond.address,
        deadline: deadline
    });

    //Add liquidity to position
    const {liquidityCallData ,liquidityValue} = NonfungiblePositionManager.addCallParameters(position, {
        slippageTolerance: new Percent(50, 10_000),
        deadline: deadline,
        tokenId: 1
    });


    // await tuffTokenDiamond.approve(uniswapV3Pool.address, hre.ethers.constants.MaxUint256);
    // await (await getWETH9Contract()).approve(uniswapV3Pool.address, hre.ethers.constants.MaxUint256);
    // await uniswapV3Pool.mint(tuffTokenDiamond.address, -130000, -100000, hre.ethers.utils.parseEther("1"), []);
}

module.exports = async () => {
    const {deployments, getNamedAccounts} = hre;
    const {contractOwner} = await hre.getNamedAccounts();

    const TuffTokenDiamond = await deployments.get("TuffTokenDiamond");
    const tuffTokenDiamond = await hre.ethers.getContractAt(TuffTokenDiamond.abi, TuffTokenDiamond.address, contractOwner);
    const uniswapV3Factory = await hre.ethers.getContractAt("UniswapV3Factory", consts("UNISWAP_V3_FACTORY_ADDR"));

    const uniswapV3Pool = await createPool(uniswapV3Factory, tuffTokenDiamond);
    await addLiquidityToPool(uniswapV3Pool, tuffTokenDiamond);
};

module.exports.tags = ['v0002'];
