// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";

import {swapEthForWeth, swapTokens} from '../utils/test_utils';
const {consts} = require("../utils/consts");

module.exports = async () => {
    if (hre.network.live) {
        console.log("[DEPLOY][v0003] - Deploying to a live network, not supplying buffChain with ETH or WETH");
        return;
    } else {
        console.log("[DEPLOY][v0003] - Supplying ETH and WETH to buffChain");
    }

    const {getNamedAccounts} = hre;
    const {deployer, buffChain} = await getNamedAccounts();
    const deployerAcct = await hre.ethers.getSigner(deployer);
    const buffChainAcct = await hre.ethers.getSigner(buffChain);

    const ethAmt = hre.ethers.utils.parseEther("100");
    const wethAmt = hre.ethers.utils.parseEther("40");
    const usdcAmt = hre.ethers.utils.parseUnits("1", 6);

    console.log(`Sending [${ethAmt}] ETH to buffChain [${buffChain}]`);
    const sendEthTx = await deployerAcct.sendTransaction({
        to: buffChain,
        value: ethAmt,
    });

    console.log(`Swapping [${wethAmt}] WETH for buffChain [${buffChain}]`);
    await swapEthForWeth(buffChainAcct, wethAmt);

    console.log(`Swapping [${usdcAmt}] USDC for buffChain [${buffChain}]`);
    await swapTokens(buffChainAcct, consts("WETH9_ADDR"), consts("USDC_ADDR"), usdcAmt);
};

module.exports.tags = ['v0003', 'test'];
