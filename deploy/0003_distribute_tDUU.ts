// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";
import { BigNumber } from "ethers";
import { TuffVBT } from "../src/types";

type TuffVBTDiamond = TuffVBT;

import {
    BUFFCHAIN_TOTAL_TUFF_PERCENTAGE,
    TOKEN_SYMBOL,
    TOKEN_DECIMALS,
    TOKEN_TOTAL_SUPPLY
} from "../utils/consts";
import { log } from "../utils/deployment_helpers";


module.exports.tags = ["v0003"];
module.exports = async () => {
    log(`Distributing ${TOKEN_SYMBOL} tokens to initial holders`);

    const { deployments, getNamedAccounts } = hre;
    const { contractOwner, buffChain } = await getNamedAccounts();
    const contractOwnerAcct = await hre.ethers.getSigner(contractOwner);

    const tuffDUUDeployment = await deployments.get(TOKEN_SYMBOL);
    const tuffDUU = await hre.ethers.getContractAt(tuffDUUDeployment.abi, tuffDUUDeployment.address, contractOwnerAcct) as TuffVBTDiamond;

    //Transfer BuffChain's tDUU tokens
    const totalTokens = (BigNumber.from(10).pow(TOKEN_DECIMALS)).mul(TOKEN_TOTAL_SUPPLY);
    const buffChainTotalCut = totalTokens.mul(BUFFCHAIN_TOTAL_TUFF_PERCENTAGE).div(100);
    log(`Sending [${buffChainTotalCut}] ${TOKEN_SYMBOL} to buffChain [${buffChain}]`);
    await (tuffDUU.connect(contractOwnerAcct) as TuffVBTDiamond).transfer(buffChain, buffChainTotalCut);

    //TODO: Create a json map of holder addresses and amount to supply. Read them in and send the appropriate tokens
    // the contractOwnerAcct
    //TODO: Groom: Clemens: web2 with user on-boarding through email and docusign (to claim tokens)?
};
