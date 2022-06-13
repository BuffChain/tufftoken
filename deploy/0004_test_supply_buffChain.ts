// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";

import {swapEthForWeth} from '../utils/test_utils';

module.exports = async () => {
    if (hre.network.live) {
        console.log("[DEPLOY][v0004] - Deploying to a live network, not supplying buffChain with ETH or WETH");
        return;
    } else {
        console.log("[DEPLOY][v0004] - Supplying ETH and WETH to buffChain");
    }

    const {getNamedAccounts} = hre;
    const {deployer, buffChain} = await getNamedAccounts();
    const deployerAcct = await hre.ethers.getSigner(deployer);
    const buffChainAcct = await hre.ethers.getSigner(buffChain);

    //Arbitrary amounts, at least `BUFFCHAIN_INIT_WETH_LIQUIDITY_WETH` is needed
    const ethAmt = hre.ethers.utils.parseEther("500");
    const wethAmt = hre.ethers.utils.parseEther("200");

    console.log(`Sending [${ethAmt}] ETH to buffChain [${buffChain}]`);
    await deployerAcct.sendTransaction({
        to: buffChain,
        value: ethAmt,
    });

    console.log(`Swapping [${wethAmt}] WETH for buffChain [${buffChain}]`);
    await swapEthForWeth(buffChainAcct, wethAmt);
};

module.exports.tags = ['v0004', 'test'];
