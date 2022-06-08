// SPDX-License-Identifier: agpl-3.0

import {getUniswapPriceQuote} from "../utils/test_utils";
import hre from "hardhat";

const {
    consts, UNISWAP_POOL_BASE_FEE
} = require("../utils/consts");

const {logDeploymentTx} = require("../utils/deployment_helpers");

module.exports = async () => {
    console.log("[DEPLOY][v0000] - Pre-deploy checks");

    const daiWethQuote = await getUniswapPriceQuote(
        consts("DAI_ADDR"),
        consts("WETH9_ADDR"),
        UNISWAP_POOL_BASE_FEE,
        3600,
        false
    );
    console.log(`Current ETH price: $${daiWethQuote}`);

    let latestBlock = await hre.ethers.provider.getBlock("latest");
    console.log(`Current Block: ${latestBlock.number}`);
};

module.exports.tags = ['v0000'];
