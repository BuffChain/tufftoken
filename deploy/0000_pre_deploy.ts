// SPDX-License-Identifier: agpl-3.0

import {getUniswapPriceQuote} from "../utils/test_utils";

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
        3600
    );

    console.log(`Current ETH price: $${1 / daiWethQuote}`);
};

module.exports.tags = ['v0000'];
