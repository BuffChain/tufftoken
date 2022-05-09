// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";
import {BigNumber} from "ethers";
import {TuffVBT} from '../src/types';
import {BUFFCHAIN_TOTAL_TUFF_PERCENTAGE, TOKEN_DECIMALS, TOKEN_TOTAL_SUPPLY} from "../utils/consts";

module.exports = async () => {
    console.log("[DEPLOY][v0003] - Distributing tokens to initial holders");

    const {deployments, getNamedAccounts} = hre;
    const {contractOwner, buffChain} = await getNamedAccounts();
    const contractOwnerAcct = await hre.ethers.getSigner(contractOwner);

    const TuffVBTDiamond = await deployments.get("TuffVBTDiamond");
    const tuffVBTDiamond = await hre.ethers.getContractAt(TuffVBTDiamond.abi, TuffVBTDiamond.address, contractOwnerAcct) as TuffVBT;

    //Transfer BuffChain's TUFF tokens
    const totalTokens = (BigNumber.from(10).pow(TOKEN_DECIMALS)).mul(TOKEN_TOTAL_SUPPLY);
    const buffChainTotalCut = totalTokens.mul(BUFFCHAIN_TOTAL_TUFF_PERCENTAGE).div(100);
    console.log(`Sending [${buffChainTotalCut}] TUFF to buffChain [${buffChain}]`);
    await (tuffVBTDiamond.connect(contractOwnerAcct) as TuffVBT).transfer(buffChain, buffChainTotalCut);

    //TODO: Create a json map of holder addresses and amount to supply. Read them in and send the appropriate tokens
    // the contractOwnerAcct
};

module.exports.tags = ['v0003'];
