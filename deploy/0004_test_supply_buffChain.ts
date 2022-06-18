// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";

import {swapEthForWeth} from '../utils/test_utils';
const { log } = require("../utils/deployment_helpers");

module.exports.tags = ["v0004", "test"];
module.exports = async () => {
    if (hre.network.live) {
        log("Deploying to a live network, not supplying buffChain with ETH or WETH");
        return;
    } else {
        log("Supplying ETH and WETH to buffChain");
    }

    const {getNamedAccounts} = hre;
    const {deployer, buffChain} = await getNamedAccounts();
    const deployerAcct = await hre.ethers.getSigner(deployer);
    const buffChainAcct = await hre.ethers.getSigner(buffChain);

    //Arbitrary amounts, at least `BUFFCHAIN_INIT_WETH_LIQUIDITY_WETH` is needed
    const ethAmt = hre.ethers.utils.parseEther("500");
    const wethAmt = hre.ethers.utils.parseEther("200");

    log(`Sending [${ethAmt}] ETH to buffChain [${buffChain}]`);
    await deployerAcct.sendTransaction({
        to: buffChain,
        value: ethAmt,
    });

    log(`Swapping [${wethAmt}] WETH for buffChain [${buffChain}]`);
    await swapEthForWeth(buffChainAcct, wethAmt);
};
