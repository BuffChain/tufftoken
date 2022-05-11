// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";
import {BigNumber} from "ethers";
import {TuffVBT, UniswapPriceConsumer} from '../src/types';
type TuffVBTDiamond = TuffVBT & UniswapPriceConsumer;

import {
    consts,
    BUFFCHAIN_TOTAL_TUFF_PERCENTAGE,
    TOKEN_SYMBOL,
    TOKEN_DECIMALS,
    TOKEN_TOTAL_SUPPLY,
    UNISWAP_POOL_BASE_FEE
} from "../utils/consts";

module.exports = async () => {
    console.log(`[DEPLOY][v0003] - Distributing ${TOKEN_SYMBOL} tokens to initial holders`);

    const {deployments, getNamedAccounts} = hre;
    const {contractOwner, buffChain} = await getNamedAccounts();
    const contractOwnerAcct = await hre.ethers.getSigner(contractOwner);

    const tuffDUUDeployment = await deployments.get(TOKEN_SYMBOL);
    const tuffDUU = await hre.ethers.getContractAt(tuffDUUDeployment.abi, tuffDUUDeployment.address, contractOwnerAcct) as TuffVBTDiamond;

    const usdcWethQuote = await tuffDUU.getUniswapQuote(
        consts("USDC_ADDR"),
        consts("WETH9_ADDR"),
        UNISWAP_POOL_BASE_FEE,
        3600
    );
    console.log(`Current ETH price: $${usdcWethQuote}`);

    //Transfer BuffChain's tDUU tokens
    const totalTokens = (BigNumber.from(10).pow(TOKEN_DECIMALS)).mul(TOKEN_TOTAL_SUPPLY);
    const buffChainTotalCut = totalTokens.mul(BUFFCHAIN_TOTAL_TUFF_PERCENTAGE).div(100);
    console.log(`Sending [${buffChainTotalCut}] ${TOKEN_SYMBOL} to buffChain [${buffChain}]`);
    await (tuffDUU.connect(contractOwnerAcct) as TuffVBTDiamond).transfer(buffChain, buffChainTotalCut);

    //TODO: Create a json map of holder addresses and amount to supply. Read them in and send the appropriate tokens
    // the contractOwnerAcct
};

module.exports.tags = ['v0003'];
