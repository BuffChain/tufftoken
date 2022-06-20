// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";
import { BigNumber } from "ethers";
import { expect } from "chai";
import { TuffVBT, TuffOwner, TokenMaturity, AaveLPManager } from "../../src/types";

type TuffVBTDiamond = TuffVBT & TuffOwner & TokenMaturity & AaveLPManager;

import {
    consts,
    UNISWAP_POOL_BASE_FEE,
    TOKEN_DAYS_UNTIL_MATURITY,
    TOKEN_DECIMALS,
    TOKEN_TOTAL_SUPPLY
} from "../../utils/consts";
import { getWETH9Contract, getADAIContract, getDAIContract, getUniswapPriceQuote } from "../../utils/utils";
import { sendTokensToAddr, assertDepositERC20ToAave } from "../../utils/test_utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Address } from "hardhat-deploy/dist/types";

const { BN, expectRevert } = require("@openzeppelin/test-helpers");

describe("TokenMaturity", function() {

    const nowTimeStamp = Math.floor(Date.now() / 1000);

    let owner: SignerWithAddress;
    let accounts: SignerWithAddress[];

    let tuffVBTDiamond: TuffVBTDiamond;

    before(async function() {
        const { contractOwner } = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.ts`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [, , ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function() {
        const { tDUU } = await hre.deployments.fixture();
        tuffVBTDiamond = await hre.ethers.getContractAt(tDUU.abi, tDUU.address, owner) as TuffVBTDiamond;
    });

    it("should get default token maturity", async () => {
        const latestBlock = await hre.ethers.provider.getBlock("latest");
        const latestTimestamp = latestBlock.timestamp;
        const secondsPerDay = 86400;

        const daysUntilMaturity =
            ((await tuffVBTDiamond.getContractMaturityTimestamp()).sub(latestTimestamp)).div(secondsPerDay);

        //Allow a 1-day buffer for account for int division With BigNumber
        const buffer = BigNumber.from(1);
        expect(daysUntilMaturity).to.be.closeTo(BigNumber.from(TOKEN_DAYS_UNTIL_MATURITY), buffer);
    });


    it("should set token maturity", async () => {
        await tuffVBTDiamond.setContractMaturityTimestamp(nowTimeStamp);

        let isMatured = await tuffVBTDiamond.isTokenMatured(nowTimeStamp - 1);

        expect(isMatured).to.equal(false, "should not have reached maturity");

        isMatured = await tuffVBTDiamond.isTokenMatured(nowTimeStamp);

        expect(isMatured).to.equal(true, "should have reached maturity");
    });

    it("should get treasury liquidation status", async () => {

        let isLiquidated = await tuffVBTDiamond.getIsTreasuryLiquidated();

        expect(isLiquidated).to.equal(false, "should not have been liquidated");

        await tuffVBTDiamond.setIsTreasuryLiquidated(true);

        isLiquidated = await tuffVBTDiamond.getIsTreasuryLiquidated();

        expect(isLiquidated).to.equal(true, "should have been liquidated");

    });


    it("should get token supply", async () => {
        let totalSupply = await tuffVBTDiamond.totalSupply();
        const expectedStartingSupply = (BigNumber.from(10).pow(TOKEN_DECIMALS)).mul(TOKEN_TOTAL_SUPPLY);

        expect(totalSupply).to.equal(expectedStartingSupply, "incorrect totalSupply");

        let totalSupplyForRedemption = await tuffVBTDiamond.totalSupplyForRedemption();
        expect(totalSupplyForRedemption).to.equal(totalSupply, "incorrect totalSupply");

        const expectedTotalSupplyForRedemption = expectedStartingSupply.sub(1);
        await tuffVBTDiamond.setTotalSupplyForRedemption(expectedTotalSupplyForRedemption);

        totalSupplyForRedemption = await tuffVBTDiamond.totalSupplyForRedemption();
        expect(totalSupplyForRedemption).to.equal(expectedTotalSupplyForRedemption, "incorrect totalSupply");
    });

    it("should get token eth balance", async () => {
        let startingEthBalance = await tuffVBTDiamond.getContractStartingEthBalance();

        expect(startingEthBalance).to.equal(0, "incorrect starting balance");

        await tuffVBTDiamond.setContractStartingEthBalance(100);

        startingEthBalance = await tuffVBTDiamond.getContractStartingEthBalance();

        expect(startingEthBalance).to.equal(100, "incorrect starting balance");
    });

    async function assertTokenMaturity() {
        const latestBlock = await hre.ethers.provider.getBlock("latest");
        const latestTimestamp = latestBlock.timestamp;

        await tuffVBTDiamond.setContractMaturityTimestamp(latestTimestamp);

        const isMatured = await tuffVBTDiamond.isTokenMatured(latestTimestamp);

        expect(isMatured).to.equal(true, "should have reached maturity");
    }

    async function assertSenderTransferSuccess(startingTuffVBTTotalSupply: BigNumber, desiredTuffVBTAmountLeftOver: BigNumber) {
        // Make transaction from first account to second.
        const sender = owner.address;
        const holder = accounts[0].address;

        const amount = startingTuffVBTTotalSupply.sub(desiredTuffVBTAmountLeftOver);
        await tuffVBTDiamond.transfer(holder, amount, { from: sender });

        const senderTuffVBTBalanceAfterTransfer = await tuffVBTDiamond.balanceOf(sender);
        expect(senderTuffVBTBalanceAfterTransfer).to.equal(desiredTuffVBTAmountLeftOver,
            "Amount wasn't correctly sent to the receiver");
        return { sender, holder, senderTuffVBTBalanceAfterTransfer };
    }

    async function assertTokenRedemptionSuccess(
        desiredTuffVBTAmountLeftOver: BigNumber,
        startingTuffVBTTotalSupply: BigNumber,
        contractStartingEthBalance: BigNumber,
        sender: Address,
        holder: Address,
        senderTuffVBTBalanceAfterTransfer: BigNumber
    ) {
        const holderTuffVBTBalanceToTotalSupplyRatio = desiredTuffVBTAmountLeftOver.div(startingTuffVBTTotalSupply);
        const expectedETHRedemptionAmount = contractStartingEthBalance.mul(holderTuffVBTBalanceToTotalSupplyRatio);

        let senderStartingEthBalance = await hre.ethers.provider.getBalance(sender);

        await expect(tuffVBTDiamond.redeem())
            .to.emit(tuffVBTDiamond, "Redeemed")
            .withArgs(sender, senderTuffVBTBalanceAfterTransfer, expectedETHRedemptionAmount);

        const senderEndingEthBalance = await hre.ethers.provider.getBalance(sender);

        //TODO: To be more precise, this test should assert that senderStartingEthBalance == senderEndingEthBalance + expectedETHRedemptionAmount
        // however, that is currently not the case
        expect(senderEndingEthBalance).to.be.lt(senderStartingEthBalance, "Sender did not successfully receive ETH");

        const senderTuffVBTBalanceAfterRedemption = await tuffVBTDiamond.balanceOf(sender);
        expect(senderTuffVBTBalanceAfterRedemption).to.equal(0,
            "Holder's balance was not reset");

        await expectRevert(tuffVBTDiamond.redeem(), "SR");

        return expectedETHRedemptionAmount;
    }

    async function assertRedemptionFunctionValues(startingTuffVBTTotalSupply: BigNumber, contractStartingEthBalance: BigNumber) {
        const endingTuffVBTTotalSupplyForRedemption = await tuffVBTDiamond.totalSupplyForRedemption();
        expect(endingTuffVBTTotalSupplyForRedemption).to.equal(startingTuffVBTTotalSupply,
            "total supply used for redemption calculation should not have been affected by " +
            "holder redeeming (and burning) tokens");

        const currentContractStartingEthBalance = await tuffVBTDiamond.getContractStartingEthBalance();
        expect(currentContractStartingEthBalance).to.equal(contractStartingEthBalance,
            "starting contract eth balance used for redemption calculation should not be affected by redemption");
    }

    async function assertBalanceAndSupplyImpact(startingTuffVBTTotalSupply: BigNumber, desiredTuffVBTAmountLeftOver: BigNumber, contractStartingEthBalance: BigNumber, expectedETHRedemptionAmount: BigNumber) {
        const totalSupplyAfterBurn = await tuffVBTDiamond.totalSupply();

        expect(totalSupplyAfterBurn).to.equal(startingTuffVBTTotalSupply.sub(desiredTuffVBTAmountLeftOver),
            "incorrect total supply after burn");

        const currentContractEthBalance = await tuffVBTDiamond.getCurrentContractEthBalance();
        expect(currentContractEthBalance).to.equal((contractStartingEthBalance.sub(expectedETHRedemptionAmount)),
            "actual eth balance should be lower than before redemption");
    }

    it("should handle token reaching maturity and holders redeeming", async () => {
        await assertTokenMaturity();

        let isLiquidated = await tuffVBTDiamond.getIsTreasuryLiquidated();
        expect(isLiquidated).to.equal(false, "should not have been liquidated");

        const tuffVBTTotalSupply = await tuffVBTDiamond.totalSupply();
        const startingOwnerTuffBal = await tuffVBTDiamond.balanceOf(owner.address);
        const contractStartingEthBalance = await tuffVBTDiamond.getCurrentContractEthBalance();

        await expect(tuffVBTDiamond.onTokenMaturity())
            .to.emit(tuffVBTDiamond, "TokenMatured")
            .withArgs(new BN(contractStartingEthBalance.toString()), new BN(tuffVBTTotalSupply.toString()));

        isLiquidated = await tuffVBTDiamond.getIsTreasuryLiquidated();
        expect(isLiquidated).to.equal(true, "should have been liquidated");

        const desiredTuffVBTAmountLeftOver = (BigNumber.from(10).pow(TOKEN_DECIMALS)).mul(BigNumber.from(100000));
        const { sender, holder, senderTuffVBTBalanceAfterTransfer } = await assertSenderTransferSuccess(
            startingOwnerTuffBal,
            desiredTuffVBTAmountLeftOver
        );
        const expectedETHRedemptionAmount = await assertTokenRedemptionSuccess(
            desiredTuffVBTAmountLeftOver,
            tuffVBTTotalSupply,
            contractStartingEthBalance,
            sender,
            holder,
            senderTuffVBTBalanceAfterTransfer
        );

        await assertRedemptionFunctionValues(tuffVBTTotalSupply, contractStartingEthBalance);

        await assertBalanceAndSupplyImpact(
            tuffVBTTotalSupply,
            desiredTuffVBTAmountLeftOver,
            contractStartingEthBalance,
            expectedETHRedemptionAmount
        );

        // allow a re-run
        await tuffVBTDiamond.onTokenMaturity();
    });

    it("should liquidate treasury", async () => {
        const daiContract = await getDAIContract();
        const adaiContract = await getADAIContract();
        const weth9Contract = await getWETH9Contract();

        await sendTokensToAddr(accounts.slice(-1)[0], tuffVBTDiamond.address);

        // deposits DAI to Aave
        await assertDepositERC20ToAave(tuffVBTDiamond, daiContract.address);

        const ethBalanceAfterDeposit = await hre.ethers.provider.getBalance(tuffVBTDiamond.address);
        const wethBalanceAfterDeposit = await weth9Contract.balanceOf(tuffVBTDiamond.address);
        const daiBalanceAfterDeposit = await daiContract.balanceOf(tuffVBTDiamond.address);
        const aDaiBalanceAfterDeposit = await adaiContract.balanceOf(tuffVBTDiamond.address);

        const liquidationTxResponse = await tuffVBTDiamond.liquidateTreasury();
        const liquidationTxReceipt = await liquidationTxResponse.wait();
        const liquidationTxGasCost = liquidationTxReceipt.gasUsed.mul(liquidationTxReceipt.effectiveGasPrice);

        const daiWethQuote = await getUniswapPriceQuote(
            consts("DAI_ADDR"),
            consts("WETH9_ADDR"),
            UNISWAP_POOL_BASE_FEE,
            60
        );

        //Note that we lose some precision here, but need this to be an int
        const daiToWethConversion = BigInt(daiBalanceAfterDeposit / Math.floor(daiWethQuote));
        const aDaiToWethConversion = BigInt(aDaiBalanceAfterDeposit / Math.floor(daiWethQuote));

        const ethBalanceAfterLiquidation = await hre.ethers.provider.getBalance(tuffVBTDiamond.address);
        const wethBalanceAfterLiquidation = await weth9Contract.balanceOf(tuffVBTDiamond.address);
        const daiBalanceAfterLiquidation = await daiContract.balanceOf(tuffVBTDiamond.address);
        const adaiBalanceAfterLiquidation = await adaiContract.balanceOf(tuffVBTDiamond.address);

        expect(daiBalanceAfterLiquidation).to.equal(0, "DAI should have been liquidated");
        expect(adaiBalanceAfterLiquidation).to.equal(0, "ADAI should have been liquidated");
        expect(wethBalanceAfterLiquidation).to.equal(0, "WETH should have been unwrapped");
        expect(ethBalanceAfterLiquidation).to.be.gt(ethBalanceAfterDeposit.add(wethBalanceAfterDeposit),
            "unexpected ETH balance");

        const expectedEth =
            BigInt(daiToWethConversion) +
            BigInt(aDaiToWethConversion) +
            BigInt(wethBalanceAfterDeposit) +
            BigInt(ethBalanceAfterDeposit.toString()) -
            BigInt(liquidationTxGasCost.toString());

        //TODO: This buffer is likely from the poolFee that uniswap charges, this test needs to be updated to account
        // for that
        const buffer = hre.ethers.utils.parseEther("0.03");
        const ethDiff = BigNumber.from(expectedEth).sub(ethBalanceAfterLiquidation);
        expect(ethDiff).to.be.lte(buffer, "eth difference exceeds allowed buffer");

        if (hre.hardhatArguments.verbose) {
            console.log(`starting amount of ETH:                       ${hre.ethers.utils.formatEther(ethBalanceAfterDeposit.toString())}`);
            console.log(`starting amount of WETH:                       ${hre.ethers.utils.formatEther(wethBalanceAfterDeposit.toString())}`);
            console.log(`expected amount of WETH from DAI swap:          ${hre.ethers.utils.formatEther(daiToWethConversion.toString())}`);
            console.log(`expected amount of WETH from ADAI swap:         ${hre.ethers.utils.formatEther(aDaiToWethConversion.toString())}`);

            console.log("--------------------------------------");

            console.log(`expected amount of ETH after swaps and unwrapping WETH:   ${hre.ethers.utils.formatEther(expectedEth.toString())}`);
            console.log(`actual amount of ETH after swaps and unwrapping WETH:     ${hre.ethers.utils.formatEther(ethBalanceAfterLiquidation.toString())}`);
            console.log(`difference from expected to actual:                         ${hre.ethers.utils.formatEther(ethDiff.toString())}`);
        }
    });

    it("should fail due to only owner check", async () => {

        await tuffVBTDiamond.setContractMaturityTimestamp(1);
        let timestamp = await tuffVBTDiamond.getContractMaturityTimestamp();
        expect(timestamp).to.equal(1, "unexpected timestamp");

        const nonOwnerAccountAddress = accounts[1].address;
        await tuffVBTDiamond.transferTuffOwnership(nonOwnerAccountAddress);

        await expectRevert(tuffVBTDiamond.setContractMaturityTimestamp(2),
            "NO");

        timestamp = await tuffVBTDiamond.getContractMaturityTimestamp();
        expect(timestamp).to.equal(1, "timestamp should be left unchanged");
    });
});
