// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";

import {swapEthForWeth} from '../utils/test_utils';

module.exports = async () => {
    if (hre.network.live) {
        console.log("[DEPLOY][v0002A] - Deploying to a live network, not supplying treasury with ETH or WETH");
        return;
    } else {
        console.log("[DEPLOY][v0002A] - Supplying ETH and WETH to TUFF's treasury contract");
    }

    const {deployments, getNamedAccounts} = hre;
    const {deployer} = await getNamedAccounts();
    const deployerAcct = await hre.ethers.getSigner(deployer);

    const ethAmt = hre.ethers.utils.parseEther("100");
    const wethAmt = hre.ethers.utils.parseEther("40");

    const TuffTokenDiamond = await deployments.get("TuffTokenDiamond");
    const tuffTokenSigner = await hre.ethers.getSigner(TuffTokenDiamond.address);

    console.log(`Sending [${ethAmt}] ETH to tuffTokenDiamond contract [${TuffTokenDiamond.address}]`);
    const sendEthTx = await deployerAcct.sendTransaction({
        to: TuffTokenDiamond.address,
        value: ethAmt,
    });

    console.log(`Swapping [${wethAmt}] WETH in tuffTokenDiamond contract [${TuffTokenDiamond.address}]`);
    await swapEthForWeth(tuffTokenSigner, wethAmt);
};

module.exports.tags = ['v0002A', 'test'];
