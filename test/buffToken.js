// SPDX-License-Identifier: agpl-3.0

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("buffToken", function () {

  let owner;
  let accounts

  let buffTokenFactory;
  let buffToken;

  let transactionFeeManagerFactory;
  let transactionFeeManager;

  let farmTreasuryFactory;
  let farmTreasury;

  before(async function () {
    buffTokenFactory = await ethers.getContractFactory("BuffToken");
    transactionFeeManagerFactory = await ethers.getContractFactory("TransactionFeeManager");
    farmTreasuryFactory = await ethers.getContractFactory("FarmTreasury");
  });

  beforeEach(async function () {
    [owner, ...accounts] = await ethers.getSigners();

    transactionFeeManager = await transactionFeeManagerFactory.deploy();
    await transactionFeeManager.deployed();

    farmTreasury = await farmTreasuryFactory.deploy();
    await farmTreasury.deployed();

    buffToken = await buffTokenFactory.deploy(transactionFeeManager.address, farmTreasury.address);
    await buffToken.deployed();
  });

  it("should get TransactionFeeManager address", async () => {
    const address = await buffToken.getTransactionManagerAddr();
    expect(address).to.equal(transactionFeeManager.address, "get TransactionFeeManager address should be equal to TransactionFeeManager address");
  });

  it('should get FarmTreasury address', async () => {
    const address = await buffToken.getFarmTreasuryAddr();
    expect(address).to.equal(farmTreasury.address, "get FarmTreasury address should be equal to FarmTreasury address");
  });

  it('should calculate farm fee amount with take fee true', async () => {
    const feeAmount = await buffToken.calculateFarmFee(100, true);
    expect(feeAmount.toString()).to.equal('5', "incorrect farm fee amount");
  });

  // it('should calculate farm fee amount with take fee false', async () => {
  //   const feeAmount = await buffToken.calculateFarmFee.call(100, false);
  //   assert.equal(feeAmount, 0, "incorrect farm fee amount");
  // });
  //
  // it('should calculate reflection fee amount with take fee true', async () => {
  //   const feeAmount = await buffToken.calculateReflectionFee.call(100, true);
  //   assert.equal(feeAmount, 5, "incorrect reflection fee amount");
  // });
  //
  // it('should calculate reflection fee amount with take fee false', async () => {
  //   const feeAmount = await buffToken.calculateReflectionFee.call(100, false);
  //   assert.equal(feeAmount, 0, "incorrect reflection fee amount");
  // });
  //
  // it('should exclude from fees', async () => {
  //   await buffToken.excludeFromFee(accounts[1]);
  //   assert.equal(await buffToken.isExcludedFromFee.call(accounts[1]), true, "account should be excluded from fee");
  // });
  //
  // it('should include in fees', async () => {
  //   await buffToken.includeInFee(accounts[1]);
  //   assert.equal(await buffToken.isExcludedFromFee.call(accounts[1]), false, "account should be included in fee");
  // });
  //
  // it('should get name', async () => {
  //   const name = await buffToken.name.call();
  //   assert.equal(name, "buffToken", "incorrect name");
  // });
  //
  // it('should get symbol', async () => {
  //   const symbol = await buffToken.symbol.call();
  //   assert.equal(symbol, "BUFF", "incorrect symbol");
  // });
  //
  // it('should get decimals', async () => {
  //   const decimals = (await buffToken.decimals.call()).toNumber();
  //   assert.equal(decimals, 9, "incorrect decimals");
  // });
  //
  // it('should get totalSupply', async () => {
  //   const totalSupply = parseFloat(await buffToken.totalSupply.call());
  //   assert.equal(totalSupply, 1000000000 * 10**9, "incorrect totalSupply");
  // });
  //
  // it('should have buffToken in the first account', async () => {
  //   const balance = await buffToken.balanceOf.call(accounts[0]);
  //   assert.equal(balance.valueOf(), 1000000000 * 10**9, "tokens weren't in the deployer account");
  // });
  //
  // it('should initialize and get allowance', async () => {
  //   const startingAllowance = parseFloat(await buffToken.allowance.call(accounts[0], accounts[1]));
  //   assert.equal(startingAllowance, 0, "incorrect starting allowance");
  //
  //   const approved = Boolean(await buffToken.approve(accounts[1], 100));
  //   assert.equal(approved, true, "should be approved");
  //
  //   const endingAllowance = parseFloat(await buffToken.allowance.call(accounts[0], accounts[1]));
  //   assert.equal(endingAllowance, 100, "incorrect ending allowance");
  // });
  //
  // it('should change allowance', async () => {
  //   const startingAllowance = parseFloat(await buffToken.allowance.call(accounts[0], accounts[2]));
  //   assert.equal(startingAllowance, 0, "incorrect starting allowance");
  //
  //   let approved = Boolean(await buffToken.increaseAllowance(accounts[2], 100));
  //   assert.equal(approved, true, "should be approved");
  //
  //   const allowance = parseFloat(await buffToken.allowance.call(accounts[0], accounts[2]));
  //   assert.equal(allowance, 100, "incorrect allowance");
  //
  //   approved = Boolean(await buffToken.decreaseAllowance(accounts[2], 100));
  //   assert.equal(approved, true, "should be approved");
  //
  //   const endingAllowance = parseFloat(await buffToken.allowance.call(accounts[0], accounts[2]));
  //   assert.equal(endingAllowance, 0, "incorrect allowance");
  // });
  //
  // it('should get total fees', async () => {
  //   const fees = await buffToken.totalFees.call();
  //   assert.equal(fees, 0, "incorrect fees");
  // });
  //
  // it('should get reward inclusion', async () => {
  //   const isExcluded = await buffToken.isExcludedFromReward.call(accounts[0]);
  //   assert.equal(isExcluded, false, "should be included in rewards");
  // });
  //
  // it('should change account rewards', async () => {
  //   let isExcluded = await buffToken.isExcludedFromReward.call(accounts[3]);
  //   assert.equal(isExcluded, false, "should be included in rewards");
  //
  //   await buffToken.excludeFromReward(accounts[3])
  //
  //   isExcluded = await buffToken.isExcludedFromReward.call(accounts[3]);
  //   assert.equal(isExcluded, true, "should be excluded from rewards");
  //
  //   await buffToken.includeInReward(accounts[3]);
  //
  //   isExcluded = await buffToken.isExcludedFromReward.call(accounts[3]);
  //   assert.equal(isExcluded, false, "should be included in rewards");
  //
  // });
  //
  // it('should get fee exclusion', async () => {
  //   let isExcluded = await buffToken.isExcludedFromFee.call(accounts[3]);
  //   assert.equal(isExcluded, false, "should be included");
  //
  //   await buffToken.excludeFromFee(accounts[3])
  //
  //   isExcluded = await buffToken.isExcludedFromFee.call(accounts[3]);
  //   assert.equal(isExcluded, true, "should be excluded");
  //
  //   await buffToken.includeInFee(accounts[3]);
  //
  //   isExcluded = await buffToken.isExcludedFromFee.call(accounts[3]);
  //   assert.equal(isExcluded, false, "should be included");
  // });
  //
  // it('should get token from reflection', async () => {
  //   const tokenFromReflection = parseFloat(await buffToken.tokenFromReflection.call(100));
  //   assert.equal(tokenFromReflection, 0, "incorrect token from reflection");
  // });
  //
  // it('should deliver tokens', async () => {
  //   await buffToken.deliver(100);
  //
  //   const fees = (await buffToken.totalFees.call()).toNumber();
  //
  //   assert.equal(fees, 100, "incorrect fees");
  // });
  //
  // it('should send token correctly - both excluded from fees', async () => {
  //   // Setup 2 accounts.
  //   const sender = accounts[0];
  //   const receiver = accounts[1];
  //
  //   let isSenderExcludedFromFees = await buffToken.isExcludedFromFee.call(sender);
  //   if (!isSenderExcludedFromFees) {
  //     await buffToken.excludeFromFee(sender);
  //     isSenderExcludedFromFees = await buffToken.isExcludedFromFee.call(sender);
  //   }
  //   assert.equal(isSenderExcludedFromFees, true, "account should be excluded from fee");
  //
  //   let isReceiverExcludedFromFees = await buffToken.isExcludedFromFee.call(receiver);
  //   if (!isReceiverExcludedFromFees) {
  //     await buffToken.excludeFromFee(receiver);
  //     isReceiverExcludedFromFees = await buffToken.isExcludedFromFee.call(receiver);
  //   }
  //   assert.equal(isReceiverExcludedFromFees, true, "account should be excluded from fee");
  //
  //   // Get initial balances of first and second account.
  //   const senderStartingBalance = parseFloat(await buffToken.balanceOf.call(sender));
  //   const receiverStartingBalance = parseFloat(await buffToken.balanceOf.call(receiver));
  //
  //   // Make transaction from first account to second.
  //   const amount = 10000000;
  //   await buffToken.transfer(receiver, amount, { from: sender });
  //
  //   // Get balances of first and second account after the transactions.
  //   const senderEndingBalance = parseFloat(await buffToken.balanceOf.call(sender));
  //   const receiverEndingBalance = parseFloat(await buffToken.balanceOf.call(receiver));
  //
  //
  //   assert.equal(senderEndingBalance, senderStartingBalance - amount, "Amount wasn't correctly taken from the sender");
  //   assert.equal(receiverEndingBalance, receiverStartingBalance + amount, "Amount wasn't correctly sent to the receiver");
  // });
  //
  // it('should send token correctly - sender excluded from fees', async () => {
  //   // Setup 2 accounts.
  //   const sender = accounts[0];
  //   const receiver = accounts[1];
  //
  //   let isSenderExcludedFromFees = await buffToken.isExcludedFromFee.call(sender);
  //   if (!isSenderExcludedFromFees) {
  //     await buffToken.excludeFromFee(sender);
  //     isSenderExcludedFromFees = await buffToken.isExcludedFromFee.call(sender);
  //   }
  //   assert.equal(isSenderExcludedFromFees, true, "account should be excluded from fee");
  //
  //   let isReceiverExcludedFromFees = await buffToken.isExcludedFromFee.call(receiver);
  //   if (isReceiverExcludedFromFees) {
  //     await buffToken.includeInFee(receiver);
  //     isReceiverExcludedFromFees = await buffToken.isExcludedFromFee.call(receiver);
  //   }
  //   assert.equal(isReceiverExcludedFromFees, false, "account should not be excluded from fee");
  //
  //   // Get initial balances of first and second account.
  //   const senderStartingBalance = parseFloat(await buffToken.balanceOf.call(sender));
  //   const receiverStartingBalance = parseFloat(await buffToken.balanceOf.call(receiver));
  //
  //   // Make transaction from first account to second.
  //   const amount = 10000000;
  //   await buffToken.transfer(receiver, amount, { from: sender });
  //
  //   // Get balances of first and second account after the transactions.
  //   const senderEndingBalance = parseFloat(await buffToken.balanceOf.call(sender));
  //   const receiverEndingBalance = parseFloat(await buffToken.balanceOf.call(receiver));
  //
  //
  //   assert.equal(senderEndingBalance, senderStartingBalance - amount, "Amount wasn't correctly taken from the sender");
  //   assert.equal(receiverEndingBalance, receiverStartingBalance + amount, "Amount wasn't correctly sent to the receiver");
  // });
  //
  // it('should send token correctly - receiver excluded from fees', async () => {
  //   // Setup 2 accounts.
  //   const sender = accounts[0];
  //   const receiver = accounts[1];
  //
  //   let isSenderExcludedFromFees = await buffToken.isExcludedFromFee.call(sender);
  //   if (isSenderExcludedFromFees) {
  //     await buffToken.includeInFee(sender);
  //     isSenderExcludedFromFees = await buffToken.isExcludedFromFee.call(sender);
  //   }
  //   assert.equal(isSenderExcludedFromFees, false, "account should not be excluded from fee");
  //
  //   let isReceiverExcludedFromFees = await buffToken.isExcludedFromFee.call(receiver);
  //   if (!isReceiverExcludedFromFees) {
  //     await buffToken.excludeFromFee(receiver);
  //     isReceiverExcludedFromFees = await buffToken.isExcludedFromFee.call(receiver);
  //   }
  //   assert.equal(isReceiverExcludedFromFees, true, "account should be excluded from fee");
  //
  //   // Get initial balances of first and second account.
  //   const senderStartingBalance = parseFloat(await buffToken.balanceOf.call(sender));
  //   const receiverStartingBalance = parseFloat(await buffToken.balanceOf.call(receiver));
  //
  //   // Make transaction from first account to second.
  //   const amount = 10000000;
  //   await buffToken.transfer(receiver, amount, { from: sender });
  //
  //   // Get balances of first and second account after the transactions.
  //   const senderEndingBalance = parseFloat(await buffToken.balanceOf.call(sender));
  //   const receiverEndingBalance = parseFloat(await buffToken.balanceOf.call(receiver));
  //
  //
  //   assert.equal(senderEndingBalance, senderStartingBalance - amount, "Amount wasn't correctly taken from the sender");
  //   assert.equal(receiverEndingBalance, receiverStartingBalance + amount, "Amount wasn't correctly sent to the receiver");
  // });
  //
  // it('should send token correctly - both included in fees', async () => {
  //   // Setup 2 accounts.
  //   const otherAccount = accounts[0];
  //   const sender = accounts[1];
  //   const receiver = accounts[2];
  //
  //   let isSenderExcludedFromFees = await buffToken.isExcludedFromFee.call(sender);
  //   if (isSenderExcludedFromFees) {
  //     await buffToken.includeInFee(sender);
  //     isSenderExcludedFromFees = await buffToken.isExcludedFromFee.call(sender);
  //   }
  //   assert.equal(isSenderExcludedFromFees, false, "account should not be excluded from fee");
  //
  //   let isReceiverExcludedFromFees = await buffToken.isExcludedFromFee.call(receiver);
  //   if (isReceiverExcludedFromFees) {
  //     await buffToken.includeInFee(receiver);
  //     isReceiverExcludedFromFees = await buffToken.isExcludedFromFee.call(receiver);
  //   }
  //   assert.equal(isReceiverExcludedFromFees, false, "account should not be excluded from fee");
  //
  //   // Get initial balances of first and second account.
  //   const senderStartingBalance = parseFloat(await buffToken.balanceOf.call(sender));
  //   const receiverStartingBalance = parseFloat(await buffToken.balanceOf.call(receiver));
  //   const farmTreasuryStartingBalance = parseFloat(await buffToken.balanceOf.call(FarmTreasury.address));
  //
  //   // Make transaction from first account to second.
  //   const amount = 10000000;
  //   await buffToken.transfer(receiver, amount, { from: sender });
  //
  //   // Get balances of first and second account after the transactions.
  //   const senderEndingBalance = parseFloat(await buffToken.balanceOf.call(sender));
  //   const receiverEndingBalance = parseFloat(await buffToken.balanceOf.call(receiver));
  //
  //
  //   const farmFeeAmount = await buffToken.calculateFarmFee.call(amount, true);
  //
  //   const reflectionFeeAmount = await buffToken.calculateReflectionFee.call(amount, true);
  //
  //   assert.equal(senderEndingBalance, senderStartingBalance - amount, "Amount wasn't correctly taken from the sender");
  //   assert.equal(receiverEndingBalance, receiverStartingBalance + amount - farmFeeAmount - reflectionFeeAmount, "Amount wasn't correctly sent to the receiver");
  //
  //   const otherAccountEndingBalance = parseFloat(await buffToken.balanceOf.call(otherAccount));
  //   assert.equal(otherAccountEndingBalance, 999999999970500000, "Amount wasn't correctly reflected to holder");
  //
  //   assert.equal(farmTreasuryStartingBalance, 0, "FarmTreasury should have an initial balance of 0");
  //   const farmTreasuryEndingBalance = parseFloat(await buffToken.balanceOf.call(FarmTreasury.address));
  //   assert.equal(farmTreasuryEndingBalance, 500000, "Amount wasn't correctly sent to Farm Treasury");
  // });
  //
  // it('should send token correctly on behalf of other account', async () => {
  //   // Setup 2 accounts.
  //   const sender = accounts[0];
  //   const receiver = accounts[1];
  //
  //   // Get initial balances of first and second account.
  //   const senderStartingBalance = parseFloat(await buffToken.balanceOf.call(sender));
  //   const receiverStartingBalance = parseFloat(await buffToken.balanceOf.call(receiver));
  //
  //   // Make transaction from first account to second.
  //   const amount = 100;
  //
  //   await buffToken.increaseAllowance(sender, amount);
  //
  //   await buffToken.transferFrom(sender, receiver, amount);
  //
  //   // Get balances of first and second account after the transactions.
  //   const senderEndingBalance = parseFloat(await buffToken.balanceOf.call(sender));
  //   const receiverEndingBalance = parseFloat(await buffToken.balanceOf.call(receiver));
  //
  //
  //   const farmFeeAmount = await buffToken.calculateFarmFee.call(amount, true);
  //
  //   const reflectionFeeAmount = await buffToken.calculateReflectionFee.call(amount, true);
  //
  //   assert.equal(senderEndingBalance, senderStartingBalance - amount, "Amount wasn't correctly taken from the sender");
  //   assert.equal(receiverEndingBalance, receiverStartingBalance + amount - farmFeeAmount - reflectionFeeAmount, "Amount wasn't correctly sent to the receiver");
  // });
});
