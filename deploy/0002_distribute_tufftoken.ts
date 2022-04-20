// SPDX-License-Identifier: agpl-3.0

import { BigNumber } from "ethers";
import hre from "hardhat";
import { TuffToken } from "../src/types/contracts/TuffToken";
import { BUFFCHAIN_INIT_LIQUIDITY_PERCENTAGE, BUFFCHAIN_TOTAL_MINTED_PERCENTAGE, TOKEN_DECIMALS, TOKEN_TOTAL_SUPPLY } from "../utils/consts";

module.exports = async () => {
    console.log("[DEPLOY][v0002] - Distributing tokens to initial holders");

    const {deployments, getNamedAccounts} = hre;
    const {contractOwner, buffChain} = await getNamedAccounts();
    const contractOwnerAcct = await hre.ethers.getSigner(contractOwner);

    const TuffTokenDiamond = await deployments.get("TuffTokenDiamond");
    const tuffTokenDiamond = await hre.ethers.getContractAt(TuffTokenDiamond.abi, TuffTokenDiamond.address, contractOwnerAcct) as TuffToken;

    const buffChainTotalCut = BigNumber.from(Math.floor(TOKEN_TOTAL_SUPPLY * BUFFCHAIN_TOTAL_MINTED_PERCENTAGE));
    const tuffAmt = hre.ethers.utils.parseUnits(buffChainTotalCut.toString(), TOKEN_DECIMALS);
    console.log(`Sending [${tuffAmt}] TUFF to buffChain [${buffChain}]`);
    await (tuffTokenDiamond.connect(contractOwnerAcct) as TuffToken).transfer(buffChain, tuffAmt);

    //TODO: Create a json map of holder addresses and amount to supply. Read them in and send the appropriate tokens
    // the contractOwnerAcct
};

module.exports.tags = ['v0002'];
