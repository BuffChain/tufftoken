// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";
import { BigNumber, Contract } from "ethers";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Address } from "hardhat-deploy/dist/types";
import { TuffVBT, AaveLPManager } from "../src/types";

const SwapRouterABI = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json").abi;

import { consts } from "./consts";
import {
    getATokenContract, getDAIContract,
    getERC20Contract, getUSDCContract, getUSDTContract, getWETH9Contract,
    transferETH
} from "./utils";

type TuffVBTDiamond = TuffVBT & AaveLPManager;

/**
 * Use this function to sign txs, within the `callbackFn`, for accounts that hardhat does not maintain.
 * @param acct: ethers.Signer account for a specific address. i.e. `await hre.ethers.getSigner(address)`
 * @param callbackFn: Async function that contains eth calls and txs to be run under the impersonated account
 * @returns {Promise<void>}
 */
export async function runCallbackImpersonatingAcct(acct: SignerWithAddress, callbackFn: (acct: SignerWithAddress) => any) {
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [acct.address]
    });

    await callbackFn(acct)
        .then(async () => {
            await hre.network.provider.request({
                method: "hardhat_stopImpersonatingAccount",
                params: [acct.address]
            });
        })
        .catch(async (err: Error) => {
            await hre.network.provider.request({
                method: "hardhat_stopImpersonatingAccount",
                params: [acct.address]
            });

            console.error(err);
            throw err;
        });
}

/**
 * Force hardhat to mine a block
 * @returns {Promise<void>}
 */
export async function mineBlock() {
    await hre.ethers.provider.send("evm_increaseTime", [consts("BLOCKTIME")]);
    await hre.ethers.provider.send("evm_mine", []);
}

export async function swapEthForWeth(toAcct: SignerWithAddress, qtyInWETH: BigNumber) {
    const weth9Contract = await getWETH9Contract();
    const uniswapSwapRouterContract = await hre.ethers.getContractAt(
        SwapRouterABI,
        consts("UNISWAP_V3_ROUTER_ADDR")
    );

    //Convert ETH to WETH
    await runCallbackImpersonatingAcct(toAcct, async (acct) => {
        await weth9Contract.connect(acct).approve(acct.address, qtyInWETH);
        await weth9Contract.connect(acct).deposit({ "value": qtyInWETH });
    });

    return { weth9Contract, uniswapSwapRouterContract };
}

/**
 * General method to procure ETH, WETH, and various stable coins to a specific address
 * @param fromAcct:
 * @param toAddr
 * @returns {Promise<void>}
 */
export async function sendTokensToAddr(fromAcct: SignerWithAddress, toAddr: Address) {
    //Set up accounts and variables
    const toAcct = await hre.ethers.getSigner(toAddr);
    await transferETH(fromAcct, toAddr);
    const expiryDate = Math.floor(Date.now() / 1000) + 60 * 20; //20 minutes from the current Unix time
    const qtyInWETH = hre.ethers.utils.parseEther("40");

    //Swap ETH for WETH
    const weth9Contract = await getWETH9Contract();
    await runCallbackImpersonatingAcct(toAcct, async (acct) => {
        await weth9Contract.connect(acct).approve(consts("UNISWAP_V3_ROUTER_ADDR"), qtyInWETH);
    });
    const { uniswapSwapRouterContract } = await swapEthForWeth(toAcct, qtyInWETH);

    //Split WETH up between DAU, USDC, and USDT
    const inWETHQty = qtyInWETH.div(4);
    await uniswapExactInputSingle(consts("WETH9_ADDR"), consts("DAI_ADDR"), uniswapSwapRouterContract, toAcct, expiryDate, inWETHQty);
    await uniswapExactInputSingle(consts("WETH9_ADDR"), consts("USDC_ADDR"), uniswapSwapRouterContract, toAcct, expiryDate, inWETHQty);
    await uniswapExactInputSingle(consts("WETH9_ADDR"), consts("USDT_ADDR"), uniswapSwapRouterContract, toAcct, expiryDate, inWETHQty);

    if (hre.hardhatArguments.verbose) {
        const daiContract = await getDAIContract();
        const usdcContract = await getUSDCContract();
        const usdtContract = await getUSDTContract();

        console.log(`[${toAddr}] balance of ETH is [${hre.ethers.utils.formatEther(await hre.ethers.provider.getBalance(toAddr))}]`);
        console.log(`[${toAddr}] balance of WETH is [${hre.ethers.utils.formatEther(await weth9Contract.balanceOf(toAddr))}]`);
        console.log(`[${toAddr}] balance of DAI is [${hre.ethers.utils.formatEther(await daiContract.balanceOf(toAddr))}]`);
        console.log(`[${toAddr}] balance of USDC is [${hre.ethers.utils.formatEther(await usdcContract.balanceOf(toAddr))}]`);
        console.log(`[${toAddr}] balance of USDT is [${hre.ethers.utils.formatEther(await usdtContract.balanceOf(toAddr))}]`);
    }
}

export async function swapTokens(toAcct: SignerWithAddress, tokenIn: Address, tokenOut: Address, qtyOut: BigNumber) {
    const expiryDate = Math.floor(Date.now() / 1000) + 60 * 20; //20 minutes from the current Unix time

    const uniswapSwapRouterContract = await hre.ethers.getContractAt(
        SwapRouterABI,
        consts("UNISWAP_V3_ROUTER_ADDR")
    );

    await uniswapExactOutputSingle(tokenIn, tokenOut, uniswapSwapRouterContract, toAcct, expiryDate, qtyOut);
}

export async function uniswapExactOutputSingle(tokenInAddr: Address, tokenOutAddr: Address,
                                               uniswapSwapRouterContract: Contract, toAcct: SignerWithAddress,
                                               expiryDate: number, outAmt: BigNumber) {
    const params = {
        tokenIn: tokenInAddr,
        tokenOut: tokenOutAddr,
        fee: 3000,
        recipient: toAcct.address,
        deadline: expiryDate,
        sqrtPriceLimitX96: 0,
        amountOut: outAmt,
        amountInMaximum: hre.ethers.constants.MaxUint256
    };

    await runCallbackImpersonatingAcct(toAcct, async (acct) => {
        await uniswapSwapRouterContract.connect(acct).exactOutputSingle(params);
    });
}

export async function uniswapExactInputSingle(tokenInAddr: Address, tokenOutAddr: Address,
                                              uniswapSwapRouterContract: Contract, toAcct: SignerWithAddress,
                                              expiryDate: number, inWETHQty: BigNumber) {
    const params = {
        tokenIn: tokenInAddr,
        tokenOut: tokenOutAddr,
        fee: 3000,
        recipient: toAcct.address,
        deadline: expiryDate,
        sqrtPriceLimitX96: 0,
        amountIn: inWETHQty,
        amountOutMinimum: 0
    };

    await runCallbackImpersonatingAcct(toAcct, async (acct) => {
        await uniswapSwapRouterContract.connect(acct).exactInputSingle(params);
    });
}

export async function assertDepositERC20ToAave(tuffVBTDiamond: TuffVBTDiamond, erc20TokenAddr: Address, tokenQtyToDeposit = "2000", isEtherFormat = false) {
    //Between depositing the ERC20 token and asserting its balance, a small amount of interest may be made
    const interestBuffer = hre.ethers.utils.parseEther("0.000005");

    let erc20Qty: BigNumber;
    if (isEtherFormat) {
        erc20Qty = BigNumber.from(tokenQtyToDeposit);
    } else {
        erc20Qty = hre.ethers.utils.parseEther(tokenQtyToDeposit);
    }

    //Check that the account has enough ERC20
    const erc20Contract = await getERC20Contract(erc20TokenAddr);
    const startERC20Qty = await erc20Contract.balanceOf(tuffVBTDiamond.address);
    expect(startERC20Qty).to.be.gt(erc20Qty);

    //Check that the account has no aToken
    const aTokenContract = await getATokenContract(erc20TokenAddr);
    const startATokenQty = await aTokenContract.balanceOf(tuffVBTDiamond.address);
    expect(BigNumber.from(0)).to.equal(startATokenQty);

    //Make the call to deposit Aave
    await tuffVBTDiamond.depositToAave(erc20TokenAddr, erc20Qty);
    // Give Aave time (1s) to complete 1:1 swap
    await hre.ethers.provider.send("evm_increaseTime", [1]);
    await hre.ethers.provider.send("evm_mine", []);

    //Check that the account has deposited the erc20Token
    const tokenQtyAfterDeposit = await erc20Contract.balanceOf(tuffVBTDiamond.address);
    expect(tokenQtyAfterDeposit).to.equal(startERC20Qty.sub(erc20Qty));

    //Check that the account now has aToken equal to the erc20Token we deposited
    const aTokenQtyAfterDeposit = await aTokenContract.balanceOf(tuffVBTDiamond.address);
    expect(aTokenQtyAfterDeposit).to.be.gte(erc20Qty);
    expect(aTokenQtyAfterDeposit).to.be.lte(erc20Qty.add(interestBuffer));

    return { startERC20Qty };
}
