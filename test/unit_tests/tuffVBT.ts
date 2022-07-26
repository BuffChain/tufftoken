// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Address } from "hardhat-deploy/dist/types";
import { TuffVBT, TokenMaturity, TuffOwner } from "../../src/types";

type TuffVBTDiamond = TuffVBT & TokenMaturity & TuffOwner;

import {
    TOKEN_TOTAL_SUPPLY, TOKEN_DECIMALS, TOKEN_SYMBOL, TOKEN_NAME, TOKEN_DAO_FEE
} from "../../utils/consts";

const { expectRevert } = require("@openzeppelin/test-helpers");

describe("TuffVBT", function() {

    let owner: SignerWithAddress;
    let tuffDAOAddr: Address;
    let accounts: SignerWithAddress[];

    let tuffVBTDiamond: TuffVBTDiamond;

    before(async function() {
        const { contractOwner, tuffDAO } = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);
        tuffDAOAddr = tuffDAO;

        //Per `hardhat.config.ts`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [, , ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function() {
        const { tDUU } = await hre.deployments.fixture();
        tuffVBTDiamond = await hre.ethers.getContractAt(tDUU.abi, tDUU.address, owner) as TuffVBTDiamond;
    });

    it("should calculate transfer fee amount with take fee true", async () => {
        const transferFee = await tuffVBTDiamond.getTransferFee();
        const feeAmount = await tuffVBTDiamond.calculateFee(100, transferFee, true);
        expect(feeAmount).to.equal(1, "incorrect transfer fee amount");
    });

    it("should calculate transfer fee amount with take fee false", async () => {
        const transferFee = await tuffVBTDiamond.getTransferFee();
        const feeAmount = await tuffVBTDiamond.calculateFee(100, transferFee, false);
        expect(feeAmount).to.equal(0, "incorrect transfer fee amount");
    });

    it("should calculate dao fee amount with take fee true", async () => {
        const daoFee = await tuffVBTDiamond.getDaoFee();
        const feeAmount = await tuffVBTDiamond.calculateFee(100, daoFee, true);
        expect(feeAmount).to.equal(10, "incorrect dao fee amount");
    });

    it("should calculate dao fee amount with take fee false", async () => {
        const daoFee = await tuffVBTDiamond.getDaoFee();
        const feeAmount = await tuffVBTDiamond.calculateFee(100, daoFee, false);
        expect(feeAmount).to.equal(0, "incorrect dao fee amount");
    });

    it("should exclude from fees", async () => {
        await tuffVBTDiamond.excludeFromFee(accounts[0].address);
        expect(await tuffVBTDiamond.isExcludedFromFee(accounts[0].address)).to.equal(true, "account should be excluded from fee");
    });

    it("should include in fees", async () => {
        await tuffVBTDiamond.includeInFee(accounts[0].address);
        expect(await tuffVBTDiamond.isExcludedFromFee(accounts[0].address)).to.equal(false, "account should be included in fee");
    });

    it("should get name", async () => {
        const name = await tuffVBTDiamond.name();
        expect(name).to.equal(TOKEN_NAME, "incorrect name");
    });

    it("should get symbol", async () => {
        const symbol = await tuffVBTDiamond.symbol();
        expect(symbol).to.equal(TOKEN_SYMBOL, "incorrect symbol");
    });

    it("should get decimals", async () => {
        const decimals = await tuffVBTDiamond.decimals();
        expect(decimals).to.equal(TOKEN_DECIMALS, "incorrect decimals");
    });

    it("should get totalSupply", async () => {
        const totalSupply = await tuffVBTDiamond.totalSupply();
        const expectedTotalTokens = (BigNumber.from(10).pow(TOKEN_DECIMALS)).mul(TOKEN_TOTAL_SUPPLY);
        expect(totalSupply).to.equal(expectedTotalTokens, "incorrect totalSupply");
    });

    it("should have TuffVBT in the owner account", async () => {
        const balance = await tuffVBTDiamond.balanceOf(owner.address);
        expect(balance).to.be.gt(0, "tokens weren't in the owner account");
    });

    it("should initialize and get allowance", async () => {
        const startingAllowance = await tuffVBTDiamond.allowance(owner.address, accounts[0].address);
        expect(startingAllowance).to.equal(0, "incorrect starting allowance");

        const approved = Boolean(await tuffVBTDiamond.approve(accounts[0].address, 100));
        expect(approved).to.equal(true, "should be approved");

        const endingAllowance = await tuffVBTDiamond.allowance(owner.address, accounts[0].address);
        expect(endingAllowance).to.equal(BigNumber.from(100), "incorrect ending allowance");
    });

    it("should change allowance", async () => {
        const startingAllowance = await tuffVBTDiamond.allowance(owner.address, accounts[1].address);
        expect(startingAllowance).to.equal(0, "incorrect starting allowance");

        let approved = Boolean(await tuffVBTDiamond.increaseAllowance(accounts[1].address, 100));
        expect(approved).to.equal(true, "should be approved");

        const allowance = await tuffVBTDiamond.allowance(owner.address, accounts[1].address);
        expect(allowance).to.equal(100, "incorrect allowance");

        approved = Boolean(await tuffVBTDiamond.decreaseAllowance(accounts[1].address, 100));
        expect(approved).to.equal(true, "should be approved");

        const endingAllowance = await tuffVBTDiamond.allowance(owner.address, accounts[1].address);
        expect(endingAllowance).to.equal(0, "incorrect allowance");
    });

    it("should get fee exclusion", async () => {
        let isExcluded = await tuffVBTDiamond.isExcludedFromFee(accounts[2].address);
        expect(isExcluded).to.equal(false, "should be included");

        await tuffVBTDiamond.excludeFromFee(accounts[2].address);

        isExcluded = await tuffVBTDiamond.isExcludedFromFee(accounts[2].address);
        expect(isExcluded).to.equal(true, "should be excluded");

        await tuffVBTDiamond.includeInFee(accounts[2].address);

        isExcluded = await tuffVBTDiamond.isExcludedFromFee(accounts[2].address);
        expect(isExcluded).to.equal(false, "should be included");
    });

    it("should send token correctly - both excluded from fees", async () => {
        // Setup 2 accounts.
        const sender = owner.address;
        const receiver = accounts[0].address;

        let isSenderExcludedFromFees = await tuffVBTDiamond.isExcludedFromFee(sender);
        if (!isSenderExcludedFromFees) {
            await tuffVBTDiamond.excludeFromFee(sender);
            isSenderExcludedFromFees = await tuffVBTDiamond.isExcludedFromFee(sender);
        }
        expect(isSenderExcludedFromFees).to.equal(true, "account should be excluded from fee");

        let isReceiverExcludedFromFees = await tuffVBTDiamond.isExcludedFromFee(receiver);
        if (!isReceiverExcludedFromFees) {
            await tuffVBTDiamond.excludeFromFee(receiver);
            isReceiverExcludedFromFees = await tuffVBTDiamond.isExcludedFromFee(receiver);
        }
        expect(isReceiverExcludedFromFees).to.equal(true, "account should be excluded from fee");

        // Get initial balances of first and second account.
        const senderStartingBalance = await tuffVBTDiamond.balanceOf(sender);
        const receiverStartingBalance = await tuffVBTDiamond.balanceOf(receiver);

        // Make transaction from first account to second.
        const amount = 10000000;
        await tuffVBTDiamond.transfer(receiver, amount, { from: sender });

        // Get balances of first and second account after the transactions.
        const senderEndingBalance = await tuffVBTDiamond.balanceOf(sender);
        const receiverEndingBalance = await tuffVBTDiamond.balanceOf(receiver);

        expect(senderEndingBalance).to.equal(senderStartingBalance.sub(amount), "Amount wasn't correctly taken from the sender");
        expect(receiverEndingBalance).to.equal(receiverStartingBalance.add(amount), "Amount wasn't correctly sent to the receiver");
    });

    it("should send token correctly - sender excluded from fees", async () => {
        // Setup 2 accounts.
        const sender = owner.address;
        const receiver = accounts[0].address;

        let isSenderExcludedFromFees = await tuffVBTDiamond.isExcludedFromFee(sender);
        if (!isSenderExcludedFromFees) {
            await tuffVBTDiamond.excludeFromFee(sender);
            isSenderExcludedFromFees = await tuffVBTDiamond.isExcludedFromFee(sender);
        }
        expect(isSenderExcludedFromFees).to.equal(true, "account should be excluded from fee");

        let isReceiverExcludedFromFees = await tuffVBTDiamond.isExcludedFromFee(receiver);
        if (isReceiverExcludedFromFees) {
            await tuffVBTDiamond.includeInFee(receiver);
            isReceiverExcludedFromFees = await tuffVBTDiamond.isExcludedFromFee(receiver);
        }
        expect(isReceiverExcludedFromFees).to.equal(false, "account should not be excluded from fee");

        // Get initial balances of first and second account.
        const senderStartingBalance = await tuffVBTDiamond.balanceOf(sender);
        const receiverStartingBalance = await tuffVBTDiamond.balanceOf(receiver);

        // Make transaction from first account to second.
        const amount = 10000000;
        await tuffVBTDiamond.transfer(receiver, amount, { from: sender });

        // Get balances of first and second account after the transactions.
        const senderEndingBalance = await tuffVBTDiamond.balanceOf(sender);
        const receiverEndingBalance = await tuffVBTDiamond.balanceOf(receiver);

        expect(senderEndingBalance).to.equal(senderStartingBalance.sub(amount), "Amount wasn't correctly taken from the sender");
        expect(receiverEndingBalance).to.equal(receiverStartingBalance.add(amount), "Amount wasn't correctly sent to the receiver");
    });

    it("should send token correctly - receiver excluded from fees", async () => {
        // Setup 2 accounts.
        const sender = owner.address;
        const receiver = accounts[0].address;

        let isSenderExcludedFromFees = await tuffVBTDiamond.isExcludedFromFee(sender);
        if (isSenderExcludedFromFees) {
            await tuffVBTDiamond.includeInFee(sender);
            isSenderExcludedFromFees = await tuffVBTDiamond.isExcludedFromFee(sender);
        }
        expect(isSenderExcludedFromFees).to.equal(false, "account should not be excluded from fee");

        let isReceiverExcludedFromFees = await tuffVBTDiamond.isExcludedFromFee(receiver);
        if (!isReceiverExcludedFromFees) {
            await tuffVBTDiamond.excludeFromFee(receiver);
            isReceiverExcludedFromFees = await tuffVBTDiamond.isExcludedFromFee(receiver);
        }
        expect(isReceiverExcludedFromFees).to.equal(true, "account should be excluded from fee");

        // Get initial balances of first and second account.
        const senderStartingBalance = await tuffVBTDiamond.balanceOf(sender);
        const receiverStartingBalance = await tuffVBTDiamond.balanceOf(receiver);

        // Make transaction from first account to second.
        const amount = 10000000;
        await tuffVBTDiamond.transfer(receiver, amount, { from: sender });

        // Get balances of first and second account after the transactions.
        const senderEndingBalance = await tuffVBTDiamond.balanceOf(sender);
        const receiverEndingBalance = await tuffVBTDiamond.balanceOf(receiver);

        expect(senderEndingBalance).to.equal(senderStartingBalance.sub(amount), "Amount wasn't correctly taken from the sender");
        expect(receiverEndingBalance).to.equal(receiverStartingBalance.add(amount), "Amount wasn't correctly sent to the receiver");
    });

    async function getFees(amount: number, takeFee: boolean) {
        const transferFee = await tuffVBTDiamond.getTransferFee();
        const daoFee = await tuffVBTDiamond.getDaoFee();
        const transferFeeAmount = await tuffVBTDiamond.calculateFee(amount, transferFee, takeFee);
        const daoFeeAmount = await tuffVBTDiamond.calculateFee(transferFeeAmount, daoFee, takeFee);
        const treasuryFeeAmount = transferFeeAmount.sub(daoFeeAmount);
        return {
            transferFeeAmount,
            treasuryFeeAmount,
            daoFeeAmount
        };
    }

    async function assetTransferBothIncludedInFee(sender: SignerWithAddress, receiver: SignerWithAddress,
                                                  amount: number, isTokenMatured: boolean) {

        // Setup sender account
        await tuffVBTDiamond.includeInFee(sender.address);
        expect(await tuffVBTDiamond.isExcludedFromFee(sender.address)).to.equal(false, "account should not be excluded from fee");
        // Give sender account tokens to send
        await tuffVBTDiamond.transfer(sender.address, amount);
        const senderStartingBalance = await tuffVBTDiamond.balanceOf(sender.address);
        expect(senderStartingBalance).to.equal(amount);

        // Setup receiver account
        await tuffVBTDiamond.includeInFee(receiver.address);
        expect(await tuffVBTDiamond.isExcludedFromFee(receiver.address)).to.equal(false, "account should not be excluded from fee");
        const receiverStartingBalance = await tuffVBTDiamond.balanceOf(receiver.address);
        expect(receiverStartingBalance).to.equal(0);

        const contractStartingBalance = await tuffVBTDiamond.balanceOf(tuffVBTDiamond.address);
        const daoWalletStartingBal = await tuffVBTDiamond.balanceOf(tuffDAOAddr);

        // Make transaction from first account to second
        await tuffVBTDiamond.connect(sender).transfer(receiver.address, amount);

        // Get ending balances after transaction
        const senderEndingBalance = await tuffVBTDiamond.balanceOf(sender.address);
        const receiverEndingBalance = await tuffVBTDiamond.balanceOf(receiver.address);

        // Get fees
        const takeFee = !isTokenMatured;
        const { transferFeeAmount, treasuryFeeAmount, daoFeeAmount } = await getFees(amount, takeFee);

        // Then determine if fees were properly taken
        expect(senderEndingBalance).to.equal(senderStartingBalance.sub(amount), "Amount wasn't correctly taken from the sender");
        expect(receiverEndingBalance).to.equal(receiverStartingBalance.add(amount).sub(transferFeeAmount), "Amount wasn't correctly sent to the receiver");

        const daoWalletEndingBal = await tuffVBTDiamond.balanceOf(tuffDAOAddr);
        expect(daoWalletEndingBal).to.equal(daoWalletStartingBal.add(daoFeeAmount), "Fee wasn't correctly sent to dao wallet");

        const contractEndingBalance = await tuffVBTDiamond.balanceOf(tuffVBTDiamond.address);
        expect(contractEndingBalance).to.equal(contractStartingBalance.add(treasuryFeeAmount), "Fee wasn't correctly sent to contract wallet");
    }

    it("should send token correctly - both included in fees - token has not matured", async () => {
        const sender = accounts[0];
        const receiver = accounts[1];
        const amount = 1000000;
        const isTokenMatured = false;
        await assetTransferBothIncludedInFee(sender, receiver, amount, isTokenMatured);
    });

    it("should send token correctly - both included in fees - token has matured", async () => {
        const sender = accounts[0];
        const receiver = accounts[1];
        const amount = 1000000;

        // assert no fees taken after token maturity
        const latestBlock = await hre.ethers.provider.getBlock("latest");
        let latestTimestamp = latestBlock.timestamp;
        await tuffVBTDiamond.setContractMaturityTimestamp(latestTimestamp);

        const isTokenMatured = await tuffVBTDiamond.isTokenMatured(latestTimestamp);

        expect(isTokenMatured).to.equal(true, "should have reached maturity");

        await assetTransferBothIncludedInFee(sender, receiver, amount, isTokenMatured);
    });

    it("should send token correctly on behalf of other account", async () => {
        const amount = 1000;

        // Setup sender account
        const sender = owner.address;
        await tuffVBTDiamond.includeInFee(sender);
        expect(await tuffVBTDiamond.isExcludedFromFee(sender)).to.equal(false, "account should not be excluded from fee");
        const senderStartingBalance = await tuffVBTDiamond.balanceOf(sender);

        // Setup receiver account
        const receiver = accounts[0].address;
        await tuffVBTDiamond.includeInFee(receiver);
        expect(await tuffVBTDiamond.isExcludedFromFee(receiver)).to.equal(false, "account should not be excluded from fee");
        const receiverStartingBalance = await tuffVBTDiamond.balanceOf(receiver);
        expect(receiverStartingBalance).to.equal(0);

        // Send tokens on behalf of the sender
        await tuffVBTDiamond.increaseAllowance(sender, amount);
        await tuffVBTDiamond.transferFrom(sender, receiver, amount);

        // Get ending balances after transaction
        const senderEndingBalance = await tuffVBTDiamond.balanceOf(sender);
        const receiverEndingBalance = await tuffVBTDiamond.balanceOf(receiver);

        // Get fees
        const { transferFeeAmount } = await getFees(amount, true);

        // Then determine if fees were properly taken
        expect(senderEndingBalance).to.equal(senderStartingBalance.sub(amount), "Amount wasn't correctly taken from the sender");
        expect(receiverEndingBalance).to.equal(receiverStartingBalance.add(amount).sub(transferFeeAmount), "Amount wasn't correctly sent to the receiver");
    });

    it("should fail due to only owner check", async () => {

        let daoFee = await tuffVBTDiamond.getDaoFee();
        expect(daoFee).to.equal(TOKEN_DAO_FEE, "unexpected starting dao fee");

        await tuffVBTDiamond.setDaoFee(2);
        daoFee = await tuffVBTDiamond.getDaoFee();
        expect(daoFee).to.equal(2, "unexpected dao fee");

        const nonOwnerAccountAddress = accounts[1].address;
        await tuffVBTDiamond.transferTuffOwnership(nonOwnerAccountAddress);

        await expectRevert(tuffVBTDiamond.setDaoFee(3), "NO");

        daoFee = await tuffVBTDiamond.getDaoFee();
        expect(daoFee).to.equal(2, "dao fee should be left unchanged");
    });
});
