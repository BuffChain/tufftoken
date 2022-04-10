// SPDX-License-Identifier: agpl-3.0

const {expect} = require("chai");
const hre = require("hardhat");
const {TUFF_TOTAL_SUPPLY} = require('../../utils/test_utils')

describe("TuffToken", function () {

    let owner;
    let accounts;

    let tuffTokenDiamond;

    before(async function () {
        const {contractOwner} = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.js`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [, , ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function () {
        const {TuffTokenDiamond} = await hre.deployments.fixture();
        tuffTokenDiamond = await hre.ethers.getContractAt(TuffTokenDiamond.abi, TuffTokenDiamond.address, owner);
    });

    it('should calculate farm fee amount with take fee true', async () => {
        const farmFee = await tuffTokenDiamond.getFarmFee();
        const feeAmount = await tuffTokenDiamond.calculateFee(100, farmFee, true);
        expect(feeAmount).to.equal(10, "incorrect farm fee amount");
    });

    it('should calculate farm fee amount with take fee false', async () => {
        const farmFee = await tuffTokenDiamond.getFarmFee();
        const feeAmount = await tuffTokenDiamond.calculateFee(100, farmFee, false);
        expect(feeAmount).to.equal(0, "incorrect farm fee amount");
    });

    it('should calculate dev fee amount with take fee true', async () => {
        const devFee = await tuffTokenDiamond.getDevFee();
        const feeAmount = await tuffTokenDiamond.calculateFee(100, devFee, true);
        expect(feeAmount).to.equal(1, "incorrect dev fee amount");
    });

    it('should calculate dev fee amount with take fee false', async () => {
        const devFee = await tuffTokenDiamond.getDevFee();
        const feeAmount = await tuffTokenDiamond.calculateFee(100, devFee, false);
        expect(feeAmount).to.equal(0, "incorrect dev fee amount");
    });

    it('should exclude from fees', async () => {
        await tuffTokenDiamond.excludeFromFee(accounts[0].address);
        expect(await tuffTokenDiamond.isExcludedFromFee(accounts[0].address)).to.equal(true, "account should be excluded from fee");
    });

    it('should include in fees', async () => {
        await tuffTokenDiamond.includeInFee(accounts[0].address);
        expect(await tuffTokenDiamond.isExcludedFromFee(accounts[0].address)).to.equal(false, "account should be included in fee");
    });

    it('should get name', async () => {
        const name = await tuffTokenDiamond.name();
        expect(name).to.equal("TuffToken", "incorrect name");
    });

    it('should get symbol', async () => {
        const symbol = await tuffTokenDiamond.symbol();
        expect(symbol).to.equal("TUFF", "incorrect symbol");
    });

    it('should get decimals', async () => {
        const decimals = (await tuffTokenDiamond.decimals());
        expect(decimals).to.equal(9, "incorrect decimals");
    });

    it('should get totalSupply', async () => {
        const totalSupply = parseFloat(await tuffTokenDiamond.totalSupply());
        expect(totalSupply).to.equal(TUFF_TOTAL_SUPPLY, "incorrect totalSupply");
    });

    it('should have TuffToken in the owner account', async () => {
        const balance = parseFloat(await tuffTokenDiamond.balanceOf(owner.address));
        expect(balance).to.equal(1000000000 * 10 ** 9, "tokens weren't in the owner account");
    });

    it('should initialize and get allowance', async () => {
        const startingAllowance = parseFloat(await tuffTokenDiamond.allowance(owner.address, accounts[0].address));
        expect(startingAllowance).to.equal(0, "incorrect starting allowance");

        const approved = Boolean(await tuffTokenDiamond.approve(accounts[0].address, 100));
        expect(approved).to.equal(true, "should be approved");

        const endingAllowance = parseFloat(await tuffTokenDiamond.allowance(owner.address, accounts[0].address));
        expect(endingAllowance).to.equal(100, "incorrect ending allowance");
    });

    it('should change allowance', async () => {
        const startingAllowance = parseFloat(await tuffTokenDiamond.allowance(owner.address, accounts[1].address));
        expect(startingAllowance).to.equal(0, "incorrect starting allowance");

        let approved = Boolean(await tuffTokenDiamond.increaseAllowance(accounts[1].address, 100));
        expect(approved).to.equal(true, "should be approved");

        const allowance = parseFloat(await tuffTokenDiamond.allowance(owner.address, accounts[1].address));
        expect(allowance).to.equal(100, "incorrect allowance");

        approved = Boolean(await tuffTokenDiamond.decreaseAllowance(accounts[1].address, 100));
        expect(approved).to.equal(true, "should be approved");

        const endingAllowance = parseFloat(await tuffTokenDiamond.allowance(owner.address, accounts[1].address));
        expect(endingAllowance).to.equal(0, "incorrect allowance");
    });

    it('should get fee exclusion', async () => {
        let isExcluded = await tuffTokenDiamond.isExcludedFromFee(accounts[2].address);
        expect(isExcluded).to.equal(false, "should be included");

        await tuffTokenDiamond.excludeFromFee(accounts[2].address)

        isExcluded = await tuffTokenDiamond.isExcludedFromFee(accounts[2].address);
        expect(isExcluded).to.equal(true, "should be excluded");

        await tuffTokenDiamond.includeInFee(accounts[2].address);

        isExcluded = await tuffTokenDiamond.isExcludedFromFee(accounts[2].address);
        expect(isExcluded).to.equal(false, "should be included");
    });

    it('should send token correctly - both excluded from fees', async () => {
        // Setup 2 accounts.
        const sender = owner.address;
        const receiver = accounts[0].address;

        let isSenderExcludedFromFees = await tuffTokenDiamond.isExcludedFromFee(sender);
        if (!isSenderExcludedFromFees) {
            await tuffTokenDiamond.excludeFromFee(sender);
            isSenderExcludedFromFees = await tuffTokenDiamond.isExcludedFromFee(sender);
        }
        expect(isSenderExcludedFromFees).to.equal(true, "account should be excluded from fee");

        let isReceiverExcludedFromFees = await tuffTokenDiamond.isExcludedFromFee(receiver);
        if (!isReceiverExcludedFromFees) {
            await tuffTokenDiamond.excludeFromFee(receiver);
            isReceiverExcludedFromFees = await tuffTokenDiamond.isExcludedFromFee(receiver);
        }
        expect(isReceiverExcludedFromFees).to.equal(true, "account should be excluded from fee");

        // Get initial balances of first and second account.
        const senderStartingBalance = parseFloat(await tuffTokenDiamond.balanceOf(sender));
        const receiverStartingBalance = parseFloat(await tuffTokenDiamond.balanceOf(receiver));

        // Make transaction from first account to second.
        const amount = 10000000;
        await tuffTokenDiamond.transfer(receiver, amount, {from: sender});

        // Get balances of first and second account after the transactions.
        const senderEndingBalance = parseFloat(await tuffTokenDiamond.balanceOf(sender));
        const receiverEndingBalance = parseFloat(await tuffTokenDiamond.balanceOf(receiver));


        expect(senderEndingBalance).to.equal(senderStartingBalance - amount, "Amount wasn't correctly taken from the sender");
        expect(receiverEndingBalance).to.equal(receiverStartingBalance + amount, "Amount wasn't correctly sent to the receiver");
    });

    it('should send token correctly - sender excluded from fees', async () => {
        // Setup 2 accounts.
        const sender = owner.address;
        const receiver = accounts[0].address;

        let isSenderExcludedFromFees = await tuffTokenDiamond.isExcludedFromFee(sender);
        if (!isSenderExcludedFromFees) {
            await tuffTokenDiamond.excludeFromFee(sender);
            isSenderExcludedFromFees = await tuffTokenDiamond.isExcludedFromFee(sender);
        }
        expect(isSenderExcludedFromFees).to.equal(true, "account should be excluded from fee");

        let isReceiverExcludedFromFees = await tuffTokenDiamond.isExcludedFromFee(receiver);
        if (isReceiverExcludedFromFees) {
            await tuffTokenDiamond.includeInFee(receiver);
            isReceiverExcludedFromFees = await tuffTokenDiamond.isExcludedFromFee(receiver);
        }
        expect(isReceiverExcludedFromFees).to.equal(false, "account should not be excluded from fee");

        // Get initial balances of first and second account.
        const senderStartingBalance = parseFloat(await tuffTokenDiamond.balanceOf(sender));
        const receiverStartingBalance = parseFloat(await tuffTokenDiamond.balanceOf(receiver));

        // Make transaction from first account to second.
        const amount = 10000000;
        await tuffTokenDiamond.transfer(receiver, amount, {from: sender});

        // Get balances of first and second account after the transactions.
        const senderEndingBalance = parseFloat(await tuffTokenDiamond.balanceOf(sender));
        const receiverEndingBalance = parseFloat(await tuffTokenDiamond.balanceOf(receiver));

        expect(senderEndingBalance).to.equal(senderStartingBalance - amount, "Amount wasn't correctly taken from the sender");
        expect(receiverEndingBalance).to.equal(receiverStartingBalance + amount, "Amount wasn't correctly sent to the receiver");
    });

    it('should send token correctly - receiver excluded from fees', async () => {
        // Setup 2 accounts.
        const sender = owner.address;
        const receiver = accounts[0].address;

        let isSenderExcludedFromFees = await tuffTokenDiamond.isExcludedFromFee(sender);
        if (isSenderExcludedFromFees) {
            await tuffTokenDiamond.includeInFee(sender);
            isSenderExcludedFromFees = await tuffTokenDiamond.isExcludedFromFee(sender);
        }
        expect(isSenderExcludedFromFees).to.equal(false, "account should not be excluded from fee");

        let isReceiverExcludedFromFees = await tuffTokenDiamond.isExcludedFromFee(receiver);
        if (!isReceiverExcludedFromFees) {
            await tuffTokenDiamond.excludeFromFee(receiver);
            isReceiverExcludedFromFees = await tuffTokenDiamond.isExcludedFromFee(receiver);
        }
        expect(isReceiverExcludedFromFees).to.equal(true, "account should be excluded from fee");

        // Get initial balances of first and second account.
        const senderStartingBalance = parseFloat(await tuffTokenDiamond.balanceOf(sender));
        const receiverStartingBalance = parseFloat(await tuffTokenDiamond.balanceOf(receiver));

        // Make transaction from first account to second.
        const amount = 10000000;
        await tuffTokenDiamond.transfer(receiver, amount, {from: sender});

        // Get balances of first and second account after the transactions.
        const senderEndingBalance = parseFloat(await tuffTokenDiamond.balanceOf(sender));
        const receiverEndingBalance = parseFloat(await tuffTokenDiamond.balanceOf(receiver));


        expect(senderEndingBalance).to.equal(senderStartingBalance - amount, "Amount wasn't correctly taken from the sender");
        expect(receiverEndingBalance).to.equal(receiverStartingBalance + amount, "Amount wasn't correctly sent to the receiver");
    });

    async function getTotalFee(amount, takeFee) {
        const farmFee = await tuffTokenDiamond.getFarmFee();
        const devFee = await tuffTokenDiamond.getDevFee();
        const farmFeeAmount = await tuffTokenDiamond.calculateFee(amount, farmFee, takeFee);
        const devFeeAmount = await tuffTokenDiamond.calculateFee(amount, devFee, takeFee);
        return parseFloat(farmFeeAmount) + parseFloat(devFeeAmount);
    }

    async function assetTransferBothIncludedInFee(sender, receiver, amount, isTokenMatured) {
        // Setup sender account
        await tuffTokenDiamond.includeInFee(sender.address);
        expect(await tuffTokenDiamond.isExcludedFromFee(sender.address)).to.equal(false, "account should not be excluded from fee");
        // Give sender account tokens to send
        await tuffTokenDiamond.transfer(sender.address, amount);
        const senderStartingBalance = parseFloat(await tuffTokenDiamond.balanceOf(sender.address));
        expect(senderStartingBalance).to.equal(amount);

        // Setup receiver account
        await tuffTokenDiamond.includeInFee(receiver.address);
        expect(await tuffTokenDiamond.isExcludedFromFee(receiver.address)).to.equal(false, "account should not be excluded from fee");
        const receiverStartingBalance = parseFloat(await tuffTokenDiamond.balanceOf(receiver.address));
        expect(receiverStartingBalance).to.equal(0);

        // Make transaction from first account to second
        await tuffTokenDiamond.connect(sender).transfer(receiver.address, amount);

        // Get ending balances after transaction
        const senderEndingBalance = parseFloat(await tuffTokenDiamond.balanceOf(sender.address));
        const receiverEndingBalance = parseFloat(await tuffTokenDiamond.balanceOf(receiver.address));

        // Get fees
        const takeFee = !isTokenMatured;
        const totalFeeAmount = await getTotalFee(amount, takeFee);

        // Then determine if fees were properly taken
        expect(senderEndingBalance).to.equal(senderStartingBalance - amount, "Amount wasn't correctly taken from the sender");
        expect(receiverEndingBalance).to.equal(receiverStartingBalance + amount - totalFeeAmount, "Amount wasn't correctly sent to the receiver");

    }

    it('should send token correctly - both included in fees - token has not matured', async () => {
        const sender = accounts[0];
        const receiver = accounts[1];
        const amount = 1000000;
        const isTokenMatured = false;
        await assetTransferBothIncludedInFee(sender, receiver, amount, isTokenMatured);
    });

    it('should send token correctly - both included in fees - token has matured', async () => {
        const sender = accounts[0];
        const receiver = accounts[1];
        const senderBalance = 1000000;
        const amountToSend = 500000;

        // assert no fees taken after token maturity
        const latestBlock = await hre.ethers.provider.getBlock("latest")
        let latestTimestamp = latestBlock.timestamp;
        await tuffTokenDiamond.setContractMaturityTimestamp(latestTimestamp);

        const isTokenMatured = await tuffTokenDiamond.isTokenMatured(latestTimestamp);

        expect(isTokenMatured).to.equal(true, "should have reached maturity");

        await assetTransferBothIncludedInFee(sender, receiver, senderBalance, amountToSend, isTokenMatured);

    });

    it('should send token correctly on behalf of other account', async () => {
        const amount = 100;

        // Setup sender account
        const sender = owner.address;
        await tuffTokenDiamond.includeInFee(sender);
        expect(await tuffTokenDiamond.isExcludedFromFee(sender)).to.equal(false, "account should not be excluded from fee");
        const senderStartingBalance = parseFloat(await tuffTokenDiamond.balanceOf(sender));

        // Setup receiver account
        const receiver = accounts[0].address;
        await tuffTokenDiamond.includeInFee(receiver);
        expect(await tuffTokenDiamond.isExcludedFromFee(receiver)).to.equal(false, "account should not be excluded from fee");
        const receiverStartingBalance = parseFloat(await tuffTokenDiamond.balanceOf(receiver));
        expect(receiverStartingBalance).to.equal(0);

        // Send tokens on behalf of the sender
        await tuffTokenDiamond.increaseAllowance(sender, amount);
        await tuffTokenDiamond.transferFrom(sender, receiver, amount);

        // Get ending balances after transaction
        const senderEndingBalance = parseFloat(await tuffTokenDiamond.balanceOf(sender));
        const receiverEndingBalance = parseFloat(await tuffTokenDiamond.balanceOf(receiver));

        // Get fees
        const totalFeeAmount = await getTotalFee(amount, true);

        // Then determine if fees were properly taken
        expect(senderEndingBalance).to.equal(senderStartingBalance - amount, "Amount wasn't correctly taken from the sender");
        expect(receiverEndingBalance).to.equal(receiverStartingBalance + amount - totalFeeAmount, "Amount wasn't correctly sent to the receiver");
    });
});
