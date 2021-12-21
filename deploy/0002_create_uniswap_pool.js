// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");
const {
    WETH9_ADDRESS, UNISWAP_POOL_BASE_FEE,
    UNISWAP_FACTORY_ADDRESS
} = require("../test/utils");

module.exports = async () => {
    const {deployments} = hre;

    const tuffTokenDiamond = await deployments.get("TuffTokenDiamond");
    const uniswapV3Factory = await hre.ethers.getContractAt("UniswapV3Factory", UNISWAP_FACTORY_ADDRESS);

    let tuffTokenPoolAddr = await uniswapV3Factory.getPool(WETH9_ADDRESS, tuffTokenDiamond.address, UNISWAP_POOL_BASE_FEE);
    if (!tuffTokenPoolAddr || tuffTokenPoolAddr === hre.ethers.constants.AddressZero) {
        console.log(`TuffToken pool not found, creating one now...`);
        await uniswapV3Factory.createPool(WETH9_ADDRESS, tuffTokenDiamond.address, UNISWAP_POOL_BASE_FEE);
        tuffTokenPoolAddr = await uniswapV3Factory.getPool(WETH9_ADDRESS, tuffTokenDiamond.address, UNISWAP_POOL_BASE_FEE);
    }
    console.log(`TuffToken pool address [${tuffTokenPoolAddr}]`);
};

module.exports.tags = ['v0002'];
