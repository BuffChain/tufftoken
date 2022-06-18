// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";
import { BigNumber, Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Address } from "hardhat-deploy/dist/types";
import { TuffVBT } from "../src/types";

const SwapRouterABI = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json").abi;
const WETH9ABI = require("@uniswap/v3-periphery/artifacts/contracts/interfaces/external/IWETH9.sol/IWETH9.json").abi;
const IERC20ABI = require("@openzeppelin/contracts/build/contracts/ERC20.json").abi;
const AaveProtocolDataProviderABI = require("@aave/protocol-v2/artifacts/contracts/misc/AaveProtocolDataProvider.sol/AaveProtocolDataProvider.json").abi;
const IUniswapV3FactoryABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json").abi;
const IUniswapV3PoolABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json").abi;

import { consts, TOKEN_DECIMALS, TOKEN_SYMBOL } from "./consts";
import { runCallbackImpersonatingAcct } from "./test_utils";

export async function getWETH9Contract() {
    return await hre.ethers.getContractAt(WETH9ABI, consts("WETH9_ADDR"));
}

export async function getDAIContract() {
    return await hre.ethers.getContractAt(IERC20ABI, consts("DAI_ADDR"));
}

export async function getUSDCContract() {
    return await hre.ethers.getContractAt(IERC20ABI, consts("USDC_ADDR"));
}

export async function getUSDTContract() {
    return await hre.ethers.getContractAt(IERC20ABI, consts("USDT_ADDR"));
}

export async function getADAIContract() {
    return await hre.ethers.getContractAt(IERC20ABI, consts("ADAI_ADDR"));
}

export async function getATokenContract(erc20TokenAddr: Address) {
    const aaveProtocolDataProvider = await hre.ethers.getContractAt(AaveProtocolDataProviderABI, consts("AAVE_PROTOCOL_DATA_PROVIDER_ADDR"));
    const result = await aaveProtocolDataProvider.getReserveTokensAddresses(erc20TokenAddr);
    return await hre.ethers.getContractAt(IERC20ABI, result.aTokenAddress);
}

export async function getERC20Contract(contractAddr: Address) {
    return await hre.ethers.getContractAt(IERC20ABI, contractAddr);
}

/**
 * Hardhat provides a default set of accounts that hold 10000 ETH each (https://hardhat.org/hardhat-network/reference/#initial-state).
 * You can use those accounts, and their signer, to send ETH to other accounts, such as contracts.
 * @param fromAcct: The signer and its address from which you want to send ETH from
 * @param toAddr: The address to receive TUFF tokens
 * @param amount: Amount of ETH to transfer Defaults to 100
 * @returns {Promise<void>}
 */
export async function transferETH(fromAcct: SignerWithAddress, toAddr: Address, amount = "100") {
    if (hre.hardhatArguments.verbose) {
        console.log(`[${fromAcct.address}] has [${hre.ethers.utils.formatEther(
            await hre.ethers.provider.getBalance(fromAcct.address))}] ETH`);
        console.log(`[${toAddr}] has [${hre.ethers.utils.formatEther(
            await hre.ethers.provider.getBalance(toAddr))}] ETH`);
    }

    const transactionHash = await fromAcct.sendTransaction({
        to: toAddr,
        value: hre.ethers.utils.parseEther(amount)
    });

    if (hre.hardhatArguments.verbose) {
        console.log(`[${fromAcct.address}] has [${hre.ethers.utils.formatEther(
            await hre.ethers.provider.getBalance(fromAcct.address))}] ETH`);
        console.log(`[${toAddr}] has [${hre.ethers.utils.formatEther(
            await hre.ethers.provider.getBalance(toAddr))}] ETH`);
    }
}

/**
 * Upon deployment of TuffVBT, the `contractOwner` account is supplied with all TUFF tokens. Thus, we use this
 * account to transfer tokens to the desired address
 * @param toAddr: The address to receive TUFF tokens
 * @param amount: Amount of TUFF tokens to transfer. Defaults to 1000000
 * @returns {Promise<void>}
 */
export async function transferTuffDUU(toAddr: Address, amount = "1000000") {
    const { deployments, getNamedAccounts } = hre;

    const { contractOwner } = await getNamedAccounts();
    const tuffDUUDeployment = await deployments.get(TOKEN_SYMBOL);
    const tuffDUU = await hre.ethers.getContractAt(
        tuffDUUDeployment.abi, tuffDUUDeployment.address,
        await hre.ethers.getSigner(contractOwner));

    if (hre.hardhatArguments.verbose) {
        console.log(`[${contractOwner}] has [${hre.ethers.utils.formatEther(
            await tuffDUU.balanceOf(contractOwner))}] ${TOKEN_SYMBOL}`);
        console.log(`[${toAddr}] has [${hre.ethers.utils.formatEther(
            await tuffDUU.balanceOf(toAddr))}] ${TOKEN_SYMBOL}`);
    }

    const tuffAmt = hre.ethers.utils.parseUnits(amount, TOKEN_DECIMALS);
    await tuffDUU.transfer(toAddr, tuffAmt, { from: contractOwner });

    if (hre.hardhatArguments.verbose) {
        console.log(`[${contractOwner}] has [${hre.ethers.utils.formatEther(
            await tuffDUU.balanceOf(contractOwner))}] ${TOKEN_SYMBOL}`);
        console.log(`[${toAddr}] has [${hre.ethers.utils.formatEther(
            await tuffDUU.balanceOf(toAddr))}] ${TOKEN_SYMBOL}`);
    }

    return tuffAmt;
}

export function getSqrtPriceX96(price: number) {
    // sqrtRatioX96 price per uniswap v3 https://docs.uniswap.org/sdk/guides/fetching-prices#understanding-sqrtprice
    return BigInt(Math.sqrt(price) * 2 ** 96).toString();
}

export async function getUniswapPoolContract(tokenA: Address, tokenB: Address, poolFee: number) {
    const uniswapV3Factory = await hre.ethers.getContractAt(IUniswapV3FactoryABI, consts("UNISWAP_V3_FACTORY_ADDR"));
    const poolAddress = await uniswapV3Factory.getPool(tokenA, tokenB, poolFee);
    return await hre.ethers.getContractAt(IUniswapV3PoolABI, poolAddress);
}

// https://docs.uniswap.org/protocol/concepts/V3-overview/oracle#tick-accumulator
export async function getUniswapPriceQuote(tokenA: Address, tokenB: Address, poolFee: number, period: number, inverse = true) {
    const poolContract = await getUniswapPoolContract(tokenA, tokenB, poolFee);
    const observations = await poolContract.observe([period, 0]);
    const tick1 = observations[0][0];
    const tick2 = observations[0][1];
    const avgTick = (tick2 - tick1) / period;
    const quote = Math.pow(1.0001, avgTick);

    const tokenADecimals = await (await getERC20Contract(tokenA)).decimals();
    const tokenBDecimals = await (await getERC20Contract(tokenB)).decimals();
    const decimalDiff = Math.abs(tokenADecimals - tokenBDecimals);
    const decimalFactor = Math.pow(10, decimalDiff);

    //Return normalized quote
    return inverse ? 1 / (quote * decimalFactor) : quote * decimalFactor;
}

export async function getAcctBal(tuffVBTDiamond: TuffVBT, acctAddr: Address, logPrefix = "") {
    const ethBal = BigNumber.from(await hre.ethers.provider.getBalance(acctAddr));

    const weth9Contract = await getWETH9Contract();
    const wethBal = BigNumber.from(await weth9Contract.balanceOf(acctAddr));

    const daiContract = await getDAIContract();
    const daiBal = BigNumber.from(await daiContract.balanceOf(acctAddr));

    const usdcContract = await getUSDCContract();
    const usdcBal = BigNumber.from(await usdcContract.balanceOf(acctAddr));

    const usdtContract = await getUSDTContract();
    const usdtBal = BigNumber.from(await usdtContract.balanceOf(acctAddr));

    const tuffBal = BigNumber.from(await tuffVBTDiamond.balanceOf(acctAddr));

    if (logPrefix) {
        console.log(`${logPrefix}[${acctAddr}] has [${hre.ethers.utils.formatEther(ethBal)}] ETH`);
        console.log(`${logPrefix}[${acctAddr}] has [${hre.ethers.utils.formatEther(wethBal)}] WETH`);
        console.log(`${logPrefix}[${acctAddr}] has [${hre.ethers.utils.formatUnits(daiBal, await daiContract.decimals())}] DAI`);
        console.log(`${logPrefix}[${acctAddr}] has [${hre.ethers.utils.formatUnits(usdcBal, await usdcContract.decimals())}] USDC`);
        console.log(`${logPrefix}[${acctAddr}] has [${hre.ethers.utils.formatUnits(usdtBal, await usdtContract.decimals())}] USDT`);
        console.log(`${logPrefix}[${acctAddr}] has [${hre.ethers.utils.formatUnits(tuffBal, TOKEN_DECIMALS)}] ${TOKEN_SYMBOL}`);
    }

    return { ethBal, wethBal, daiBal, usdcBal, usdtBal, tuffBal };
}
