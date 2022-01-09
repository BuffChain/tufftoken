// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");

const {consts, UNISWAP_POOL_BASE_FEE} = require("../utils/consts");
const {logDeploymentTx} = require("../utils/deployment_helpers");

module.exports = async () => {
    const {deployments} = hre;

    const tuffTokenDiamond = await deployments.get("TuffTokenDiamond");
    const uniswapV3Factory = await hre.ethers.getContractAt("UniswapV3Factory", consts("UNISWAP_V3_FACTORY_ADDR"));

    let tuffTokenPoolAddr = await uniswapV3Factory.getPool(consts("WETH9_ADDR"), tuffTokenDiamond.address, UNISWAP_POOL_BASE_FEE);
    if (!tuffTokenPoolAddr || tuffTokenPoolAddr === hre.ethers.constants.AddressZero) {
        console.log(`TuffToken pool not found, creating one now...`);

        let createPoolTx = await uniswapV3Factory.createPool(consts("WETH9_ADDR"), tuffTokenDiamond.address, UNISWAP_POOL_BASE_FEE);
        logDeploymentTx("Created pool:", createPoolTx);

        tuffTokenPoolAddr = await uniswapV3Factory.getPool(consts("WETH9_ADDR"), tuffTokenDiamond.address, UNISWAP_POOL_BASE_FEE);
    }
    console.log(`TuffToken pool address [${tuffTokenPoolAddr}]`);

    const uniswapV3Pool = await hre.ethers.getContractAt("UniswapV3Pool", tuffTokenPoolAddr);



    // Current: price should be $.01, 1 DAI = 0.0003139 ETH, .01 DAI = 0.00000313875 ETH
    const price = 0.00000313875

    // sqrtRatioX96 price per uniswap v3 https://docs.uniswap.org/sdk/guides/fetching-prices#understanding-sqrtprice
    const sqrtPriceX96 = BigInt(Math.sqrt(price) * 2 ** 96).toString();


    console.log(`Initializing TuffToken pool. Price: ${price} ETH. sqrtPriceX96: ${sqrtPriceX96}`);
    await uniswapV3Pool.initialize(sqrtPriceX96);


    console.log(`Minting new position on TuffToken pool`);
    const token0 = consts("WETH9_ADDR");
    const token1 = tuffTokenDiamond.address;
    const amount0ToMint = 0;
    const amount1ToMint = 150000000
    await tuffTokenDiamond.mintNewPosition(token0, amount0ToMint, token1, amount1ToMint, UNISWAP_POOL_BASE_FEE)

};

module.exports.tags = ['v0002'];
