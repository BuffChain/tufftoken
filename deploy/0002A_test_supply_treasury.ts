// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";

import {swapEthForWeth} from '../utils/test_utils';

module.exports = async () => {
    if (hre.network.live) {
        console.log("[DEPLOY][v0002A] - Deploying to a live network, not supplying contractOwner with ETH or WETH");
        return;
    } else {
        console.log("[DEPLOY][v0002A] - Supplying ETH and WETH to contractOwner");
    }

    const {getNamedAccounts} = hre;
    const {deployer, contractOwner} = await getNamedAccounts();
    const deployerAcct = await hre.ethers.getSigner(deployer);
    const contractOwnerAcct = await hre.ethers.getSigner(contractOwner);

    const ethAmt = hre.ethers.utils.parseEther("100");
    const wethAmt = hre.ethers.utils.parseEther("40");

    console.log(`Sending [${ethAmt}] ETH to contractOwner [${contractOwner}]`);
    const sendEthTx = await deployerAcct.sendTransaction({
        to: contractOwner,
        value: ethAmt,
    });

    console.log(`Swapping [${wethAmt}] WETH for contractOwner [${contractOwner}]`);
    await swapEthForWeth(contractOwnerAcct, wethAmt);
};

module.exports.tags = ['v0002A', 'test'];
