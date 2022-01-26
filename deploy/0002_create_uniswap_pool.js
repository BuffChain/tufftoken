// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");

const {consts, UNISWAP_POOL_BASE_FEE} = require("../utils/consts");
const {logDeploymentTx} = require("../utils/deployment_helpers");
const {sqrtPriceX96} = require("../utils/test_utils");

module.exports = async () => {
    const {deployments, getNamedAccounts} = hre;

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

    const price = consts("TUFF_STARTING_PRICE")

    const tuffTokenSqrtPriceX96 = sqrtPriceX96(price);

    console.log(`Initializing TuffToken pool. Price: ${price} ETH. sqrtPriceX96: ${tuffTokenSqrtPriceX96}`);
    await uniswapV3Pool.initialize(tuffTokenSqrtPriceX96);

};

module.exports.tags = ['v0002'];
