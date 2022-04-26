// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";
import {BigNumber} from "ethers";
import {TuffToken} from '../src/types';
import {BUFFCHAIN_TOTAL_MINTED_PERCENTAGE, TOKEN_DECIMALS, TOKEN_TOTAL_SUPPLY} from "../utils/consts";

module.exports = async () => {
    console.log("[DEPLOY][v0002] - Distributing tokens to initial holders");

    const {deployments, getNamedAccounts} = hre;
    const {contractOwner, buffChain} = await getNamedAccounts();
    const contractOwnerAcct = await hre.ethers.getSigner(contractOwner);

    const TuffTokenDiamond = await deployments.get("TuffTokenDiamond");
    const tuffTokenDiamond = await hre.ethers.getContractAt(TuffTokenDiamond.abi, TuffTokenDiamond.address, contractOwnerAcct) as TuffToken;

    //Transfer BuffChain's TUFF tokens
    const totalTokens = (BigNumber.from(10).pow(TOKEN_DECIMALS)).mul(TOKEN_TOTAL_SUPPLY);
    const buffChainTotalCut = totalTokens.mul(BUFFCHAIN_TOTAL_MINTED_PERCENTAGE).div(100);
    console.log(`Sending [${buffChainTotalCut}] TUFF to buffChain [${buffChain}]`);
    await (tuffTokenDiamond.connect(contractOwnerAcct) as TuffToken).transfer(buffChain, buffChainTotalCut);

    //TODO: Create a json map of holder addresses and amount to supply. Read them in and send the appropriate tokens
    // the contractOwnerAcct
};

module.exports.tags = ['v0002'];
