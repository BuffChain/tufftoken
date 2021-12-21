// SPDX-License-Identifier: agpl-3.0

const hre = require("hardhat");

const consts = require("../consts");

module.exports = async () => {
    const {deployments} = hre;

    const tuffTokenDiamond = await deployments.get("TuffTokenDiamond");
    const uniswapV3Factory = await hre.ethers.getContractAt("UniswapV3Factory", consts.UNISWAP_V3_FACTORY_ADDRESS);

    let tuffTokenPoolAddr = await uniswapV3Factory.getPool(consts.WETH9_ADDRESS, tuffTokenDiamond.address, consts.UNISWAP_POOL_BASE_FEE);
    if (!tuffTokenPoolAddr || tuffTokenPoolAddr === hre.ethers.constants.AddressZero) {
        console.log(`TuffToken pool not found, creating one now...`);
        await uniswapV3Factory.createPool(consts.WETH9_ADDRESS, tuffTokenDiamond.address, consts.UNISWAP_POOL_BASE_FEE);
        tuffTokenPoolAddr = await uniswapV3Factory.getPool(consts.WETH9_ADDRESS, tuffTokenDiamond.address, consts.UNISWAP_POOL_BASE_FEE);
    }
    console.log(`TuffToken pool address [${tuffTokenPoolAddr}]`);
};

module.exports.tags = ['v0002'];
