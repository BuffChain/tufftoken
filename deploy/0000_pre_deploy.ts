// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";

import {
    consts, UNISWAP_POOL_BASE_FEE
} from "../utils/consts";
import { getUniswapPriceQuote } from "../utils/utils";
import { log } from "../utils/deployment_helpers";

module.exports.tags = ["v0000"];
module.exports = async () => {
    log("Pre-deploy checks");

    const daiWethQuote = await getUniswapPriceQuote(
        consts("DAI_ADDR"),
        consts("WETH9_ADDR"),
        UNISWAP_POOL_BASE_FEE,
        3600,
        false
    );
    log(`Current ETH price: $${daiWethQuote}`);

    let latestBlock = await hre.ethers.provider.getBlock("latest");
    log(`Current Block: ${latestBlock.number}`);
};
