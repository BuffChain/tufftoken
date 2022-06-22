// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";
import { BigNumber } from "ethers";
import { expect } from "chai";
import { TuffVBT, TuffOwner, TokenMaturity, AaveLPManager } from "../../src/types";

type TuffVBTDiamond = TuffVBT & TuffOwner & TokenMaturity & AaveLPManager;

import {
    TOKEN_DAYS_UNTIL_MATURITY,
    TOKEN_DECIMALS,
    TOKEN_TOTAL_SUPPLY
} from "../../utils/consts";
import {
    getWETH9Contract,
    getDAIContract, getUSDCContract, getUSDTContract, getATokenContract,
    getDaiWethQuote, getUsdcWethQuote, getUsdtWethQuote
} from "../../utils/utils";
import { sendTokensToAddr, assertDepositERC20ToAave } from "../../utils/test_utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Address } from "hardhat-deploy/dist/types";

const { expectRevert } = require("@openzeppelin/test-helpers");

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

    async function assertSenderTransferSuccess(holder: Address, startingTuffVBTTotalSupply: BigNumber, desiredTuffVBTAmountLeftOver: BigNumber) {
        // Make transaction from first account to second.
        const sender = owner.address;

        const amount = startingTuffVBTTotalSupply.sub(desiredTuffVBTAmountLeftOver);
        await tuffVBTDiamond.transfer(holder, amount, { from: sender });

        const senderTuffVBTBalanceAfterTransfer = await tuffVBTDiamond.balanceOf(sender);
        expect(senderTuffVBTBalanceAfterTransfer).to.equal(desiredTuffVBTAmountLeftOver,
            "Amount wasn't correctly sent to the receiver");
        return { sender, senderTuffVBTBalanceAfterTransfer };
    }

    async function assertTokenRedemptionSuccess(
        desiredTuffVBTAmountLeftOver: BigNumber,
        startingTuffVBTTotalSupply: BigNumber,
        contractStartingEthBalance: BigNumber,
        sender: Address,
        holderAddr: Address,
        senderTuffVBTBalanceAfterTransfer: BigNumber
    ) {
        const holderTuffVBTBalanceToTotalSupplyRatio = desiredTuffVBTAmountLeftOver.div(startingTuffVBTTotalSupply);
        const expectedETHRedemptionAmount = contractStartingEthBalance.mul(holderTuffVBTBalanceToTotalSupplyRatio);

        //TODO: @Ian, contractStartingEthBalance, holderTuffVBTBalanceToTotalSupplyRatio, expectedETHRedemptionAmount
        // are 0, which doesn't make sense to me. The test passes, but I don't think it should given they're all 0

        // console.log(`desiredTuffVBTAmountLeftOver: ${desiredTuffVBTAmountLeftOver}`);
        // console.log(`startingTuffVBTTotalSupply: ${startingTuffVBTTotalSupply}`);
        // console.log(`holderTuffVBTBalanceToTotalSupplyRatio: ${holderTuffVBTBalanceToTotalSupplyPercentage}`);
        // console.log(`contractStartingEthBalance: ${contractStartingEthBalance}`);
        // console.log(`expectedETHRedemptionAmount: ${expectedETHRedemptionAmount}`);
        // console.log(`-----------------------------`);

        let senderStartingEthBalance = await hre.ethers.provider.getBalance(sender);

        const redeemTxResponse = await tuffVBTDiamond.redeem();
        const redeemTxReceipt = await redeemTxResponse.wait();

        expect(redeemTxReceipt.events).to.have.lengthOf.greaterThan(0);
        // @ts-ignore: length is asserted above
        const redeemEvent = redeemTxReceipt.events.filter(event => event.event === "Redeemed");
        expect(redeemEvent.length).to.equal(1);
        expect(redeemEvent[0]?.args?.holder).to.equal(sender);
        expect(redeemEvent[0]?.args?.tuffBalance).to.equal(senderTuffVBTBalanceAfterTransfer);
        expect(redeemEvent[0]?.args?.ethAmount).to.equal(expectedETHRedemptionAmount);

        const senderEndingEthBalance = await hre.ethers.provider.getBalance(sender);
        const redeemTxGasCost = redeemTxReceipt.gasUsed.mul(redeemTxReceipt.effectiveGasPrice);
        expect(senderEndingEthBalance).to.equal(
            senderStartingEthBalance.add(expectedETHRedemptionAmount).sub(redeemTxGasCost),
            "Sender did not successfully receive ETH");

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
        const holderAddr = accounts.slice(-1)[0].address;
        await assertTokenMaturity();

        let isLiquidated = await tuffVBTDiamond.getIsTreasuryLiquidated();
        expect(isLiquidated).to.equal(false, "should not have been liquidated");

        const tuffVBTTotalSupply = await tuffVBTDiamond.totalSupply();
        const startingOwnerTuffBal = await tuffVBTDiamond.balanceOf(owner.address);
        const contractStartingEthBalance = await tuffVBTDiamond.getCurrentContractEthBalance();

        await expect(tuffVBTDiamond.onTokenMaturity())
            .to.emit(tuffVBTDiamond, "TokenMatured")
            .withArgs(contractStartingEthBalance, tuffVBTTotalSupply);

        isLiquidated = await tuffVBTDiamond.getIsTreasuryLiquidated();
        expect(isLiquidated).to.equal(true, "should have been liquidated");

        const desiredTuffVBTAmountLeftOver = (BigNumber.from(10).pow(TOKEN_DECIMALS)).mul(BigNumber.from(100000));
        const { sender, senderTuffVBTBalanceAfterTransfer } = await assertSenderTransferSuccess(
            holderAddr,
            startingOwnerTuffBal,
            desiredTuffVBTAmountLeftOver
        );
        const expectedETHRedemptionAmount = await assertTokenRedemptionSuccess(
            desiredTuffVBTAmountLeftOver,
            tuffVBTTotalSupply,
            contractStartingEthBalance,
            sender,
            holderAddr,
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
        const adaiContract = await getATokenContract(daiContract.address);
        const usdcContract = await getUSDCContract();
        const ausdcContract = await getATokenContract(usdcContract.address);
        const usdtContract = await getUSDTContract();
        const ausdtContract = await getATokenContract(usdtContract.address);
        const weth9Contract = await getWETH9Contract();

        await sendTokensToAddr(accounts.slice(-1)[0], tuffVBTDiamond.address)

        //Deposits supported tokens to Aave
        await assertDepositERC20ToAave(tuffVBTDiamond, daiContract.address);
        await assertDepositERC20ToAave(tuffVBTDiamond, usdcContract.address);
        await assertDepositERC20ToAave(tuffVBTDiamond, usdtContract.address);

        //Get starting balances
        const ethBalanceAfterDeposit = await hre.ethers.provider.getBalance(tuffVBTDiamond.address);
        const wethBalanceAfterDeposit = await weth9Contract.balanceOf(tuffVBTDiamond.address);
        const daiBalanceAfterDeposit = await daiContract.balanceOf(tuffVBTDiamond.address);
        const aDaiBalanceAfterDeposit = await adaiContract.balanceOf(tuffVBTDiamond.address);
        const usdcBalanceAfterDeposit = BigNumber.from(hre.ethers.utils.parseUnits(
            (await usdcContract.balanceOf(tuffVBTDiamond.address)).toString(), 18 - await usdcContract.decimals()));
        const ausdcBalanceAfterDeposit = BigNumber.from(hre.ethers.utils.parseUnits(
            (await ausdcContract.balanceOf(tuffVBTDiamond.address)).toString(), 18 - await ausdcContract.decimals()));
        const usdtBalanceAfterDeposit = BigNumber.from(hre.ethers.utils.parseUnits(
            (await usdtContract.balanceOf(tuffVBTDiamond.address)).toString(), 18 - await usdtContract.decimals()));
        const ausdtBalanceAfterDeposit = BigNumber.from(hre.ethers.utils.parseUnits(
            (await ausdtContract.balanceOf(tuffVBTDiamond.address)).toString(), 18 - await ausdtContract.decimals()));

        const daiWethQuote = await getDaiWethQuote();
        const daiToWethConversion = daiBalanceAfterDeposit.div(Math.floor(daiWethQuote));
        const aDaiToWethConversion = aDaiBalanceAfterDeposit.div(Math.floor(daiWethQuote));

        const usdcWethQuote = await getUsdcWethQuote();
        const usdcToWethConversion = usdcBalanceAfterDeposit.div(Math.floor(usdcWethQuote));
        const ausdcToWethConversion = ausdcBalanceAfterDeposit.div(Math.floor(usdcWethQuote));

        const usdtWethQuote = await getUsdtWethQuote();
        const usdtToWethConversion = usdtBalanceAfterDeposit.div(Math.floor(usdtWethQuote));
        const ausdtToWethConversion = ausdtBalanceAfterDeposit.div(Math.floor(usdtWethQuote));

        //Liquidate treasury
        const liquidationTxResponse = await tuffVBTDiamond.liquidateTreasury();
        const liquidationTxReceipt = await liquidationTxResponse.wait();
        const liquidationTxGasCost = liquidationTxReceipt.gasUsed.mul(liquidationTxReceipt.effectiveGasPrice);

        //Verify that all holding were sold
        const ethBalanceAfterLiquidation = await hre.ethers.provider.getBalance(tuffVBTDiamond.address);
        const wethBalanceAfterLiquidation = await weth9Contract.balanceOf(tuffVBTDiamond.address);
        const daiBalanceAfterLiquidation = await daiContract.balanceOf(tuffVBTDiamond.address);
        const adaiBalanceAfterLiquidation = await adaiContract.balanceOf(tuffVBTDiamond.address);
        const usdcBalanceAfterLiquidation = await usdcContract.balanceOf(tuffVBTDiamond.address);
        const ausdcBalanceAfterLiquidation = await ausdcContract.balanceOf(tuffVBTDiamond.address);
        const usdtBalanceAfterLiquidation = await usdtContract.balanceOf(tuffVBTDiamond.address);
        const ausdtBalanceAfterLiquidation = await ausdtContract.balanceOf(tuffVBTDiamond.address);

        expect(daiBalanceAfterLiquidation).to.equal(0);
        expect(adaiBalanceAfterLiquidation).to.equal(0);
        expect(usdcBalanceAfterLiquidation).to.equal(0);
        expect(ausdcBalanceAfterLiquidation).to.equal(0);
        expect(usdtBalanceAfterLiquidation).to.equal(0);
        expect(ausdtBalanceAfterLiquidation).to.equal(0);
        expect(wethBalanceAfterLiquidation).to.equal(0);
        expect(ethBalanceAfterLiquidation).to.be.gt(ethBalanceAfterDeposit.add(wethBalanceAfterDeposit));

        //Add up holdings to find expected amount and compare to actual amount
        // This buffer includes unknowns like Uniswap's pool and swap fees, the price impact of selling those tokens,
        // and differences between different oracle's quotes
        const buffer = hre.ethers.utils.parseEther("0.3");
        const expectedEth = ethBalanceAfterDeposit
                .add(wethBalanceAfterDeposit)
                .add(daiToWethConversion)
                .add(aDaiToWethConversion)
                .add(usdcToWethConversion)
                .add(ausdcToWethConversion)
                .add(usdtToWethConversion)
                .add(ausdtToWethConversion)
                .sub(liquidationTxGasCost);
        expect(ethBalanceAfterLiquidation).to.be.closeTo(expectedEth, buffer);
    });

    it("should fail due to only owner check", async () => {
        await tuffVBTDiamond.setContractMaturityTimestamp(1);
        let timestamp = await tuffVBTDiamond.getContractMaturityTimestamp();
        expect(timestamp).to.equal(1, "unexpected timestamp");

        const nonOwnerAccountAddress = accounts[1].address;
        await tuffVBTDiamond.transferTuffOwnership(nonOwnerAccountAddress);

        await expectRevert(tuffVBTDiamond.setContractMaturityTimestamp(2), "NO");

        timestamp = await tuffVBTDiamond.getContractMaturityTimestamp();
        expect(timestamp).to.equal(1, "timestamp should be left unchanged");
    });
});
