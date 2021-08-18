// SPDX-License-Identifier: agpl-3.0

const chai = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);

const { expect } = chai;
const { ethers } = require("hardhat");


describe("TuffToken", function () {

  let owner;
  let accounts;

  let tuffTokenFactory;
  let tuffToken;

  let farmTreasuryFactory;
  let farmTreasury;

  before(async function () {
    tuffTokenFactory = await ethers.getContractFactory("TuffToken");
    farmTreasuryFactory = await ethers.getContractFactory("FarmTreasury");
  });

  beforeEach(async function () {
    [owner, ...accounts] = await ethers.getSigners();

    farmTreasury = await farmTreasuryFactory.deploy();
    await farmTreasury.deployed();

    tuffToken = await tuffTokenFactory.deploy(farmTreasury.address);
    await tuffToken.deployed();
  });

  it('should get FarmTreasury address', async () => {
    const address = await tuffToken.getFarmTreasuryAddr();
    expect(address).to.equal(farmTreasury.address, "get FarmTreasury address should be equal to FarmTreasury address");
  });

  it('should calculate farm fee amount with take fee true', async () => {
    const feeAmount = await tuffToken.calculateFarmFee(100, true);
    expect(feeAmount).to.equal(5, "incorrect farm fee amount");
  });

  it('should calculate farm fee amount with take fee false', async () => {
    const feeAmount = await tuffToken.calculateFarmFee(100, false);
    expect(feeAmount).to.equal(0, "incorrect farm fee amount");
  });

  it('should calculate reflection fee amount with take fee true', async () => {
    const feeAmount = await tuffToken.calculateReflectionFee(100, true);
    expect(feeAmount).to.equal(5, "incorrect reflection fee amount");
  });

  it('should calculate reflection fee amount with take fee false', async () => {
    const feeAmount = await tuffToken.calculateReflectionFee(100, false);
    expect(feeAmount).to.equal(0, "incorrect reflection fee amount");
  });

  it('should exclude from fees', async () => {
    await tuffToken.excludeFromFee(accounts[1].getAddress());
    expect(await tuffToken.isExcludedFromFee(accounts[1].getAddress())).to.equal(true, "account should be excluded from fee");
  });

  it('should include in fees', async () => {
    await tuffToken.includeInFee(accounts[1].getAddress());
    expect(await tuffToken.isExcludedFromFee(accounts[1].getAddress())).to.equal(false, "account should be included in fee");
  });

  it('should get name', async () => {
    const name = await tuffToken.name();
    expect(name).to.equal("TuffToken", "incorrect name");
  });

  it('should get symbol', async () => {
    const symbol = await tuffToken.symbol();
    expect(symbol).to.equal("TUFF", "incorrect symbol");
  });

  it('should get decimals', async () => {
    const decimals = (await tuffToken.decimals());
    expect(decimals).to.equal(9, "incorrect decimals");
  });

  it('should get totalSupply', async () => {
    const totalSupply = parseFloat(await tuffToken.totalSupply());
    expect(totalSupply).to.equal(1000000000 * 10**9, "incorrect totalSupply");
  });

  it('should have TuffToken in the owner account', async () => {
    const balance = parseFloat(await tuffToken.balanceOf(owner.getAddress()));
    expect(balance).to.equal(1000000000 * 10**9, "tokens weren't in the owner account");
  });

  it('should initialize and get allowance', async () => {
    const startingAllowance = parseFloat(await tuffToken.allowance(owner.getAddress(), accounts[1].getAddress()));
    expect(startingAllowance).to.equal(0, "incorrect starting allowance");

    const approved = Boolean(await tuffToken.approve(accounts[1].getAddress(), 100));
    expect(approved).to.equal(true, "should be approved");

    const endingAllowance = parseFloat(await tuffToken.allowance(owner.getAddress(), accounts[1].getAddress()));
    expect(endingAllowance).to.equal(100, "incorrect ending allowance");
  });

  it('should change allowance', async () => {
    const startingAllowance = parseFloat(await tuffToken.allowance(owner.getAddress(), accounts[2].getAddress()));
    expect(startingAllowance).to.equal(0, "incorrect starting allowance");

    let approved = Boolean(await tuffToken.increaseAllowance(accounts[2].getAddress(), 100));
    expect(approved).to.equal(true, "should be approved");

    const allowance = parseFloat(await tuffToken.allowance(owner.getAddress(), accounts[2].getAddress()));
    expect(allowance).to.equal(100, "incorrect allowance");

    approved = Boolean(await tuffToken.decreaseAllowance(accounts[2].getAddress(), 100));
    expect(approved).to.equal(true, "should be approved");

    const endingAllowance = parseFloat(await tuffToken.allowance(owner.getAddress(), accounts[2].getAddress()));
    expect(endingAllowance).to.equal(0, "incorrect allowance");
  });

  it('should get total fees', async () => {
    const fees = await tuffToken.totalFees();
    expect(fees).to.equal(0, "incorrect fees");
  });

  it('should get reward inclusion', async () => {
    const isExcluded = await tuffToken.isExcludedFromReward(owner.getAddress());
    expect(isExcluded).to.equal(false, "should be included in rewards");
  });

  it('should change account rewards', async () => {
    let isExcluded = await tuffToken.isExcludedFromReward(accounts[3].getAddress());
    expect(isExcluded).to.equal(false, "should be included in rewards");

    await tuffToken.excludeFromReward(accounts[3].getAddress())

    isExcluded = await tuffToken.isExcludedFromReward(accounts[3].getAddress());
    expect(isExcluded).to.equal(true, "should be excluded from rewards");

    await tuffToken.includeInReward(accounts[3].getAddress());

    isExcluded = await tuffToken.isExcludedFromReward(accounts[3].getAddress());
    expect(isExcluded).to.equal(false, "should be included in rewards");

  });

  it('should get fee exclusion', async () => {
    let isExcluded = await tuffToken.isExcludedFromFee(accounts[3].getAddress());
    expect(isExcluded).to.equal(false, "should be included");

    await tuffToken.excludeFromFee(accounts[3].getAddress())

    isExcluded = await tuffToken.isExcludedFromFee(accounts[3].getAddress());
    expect(isExcluded).to.equal(true, "should be excluded");

    await tuffToken.includeInFee(accounts[3].getAddress());

    isExcluded = await tuffToken.isExcludedFromFee(accounts[3].getAddress());
    expect(isExcluded).to.equal(false, "should be included");
  });

  it('should get token from reflection', async () => {
    const tokenFromReflection = parseFloat(await tuffToken.tokenFromReflection(100));
    expect(tokenFromReflection).to.equal(0, "incorrect token from reflection");
  });

  it('should deliver tokens', async () => {
    await tuffToken.deliver(100);

    const fees = (await tuffToken.totalFees()).toNumber();

    expect(fees).to.equal(100, "incorrect fees");
  });

  it('should send token correctly - both excluded from fees', async () => {
    // Setup 2 accounts.
    const sender = owner.getAddress();
    const receiver = accounts[1].getAddress();

    let isSenderExcludedFromFees = await tuffToken.isExcludedFromFee(sender);
    if (!isSenderExcludedFromFees) {
      await tuffToken.excludeFromFee(sender);
      isSenderExcludedFromFees = await tuffToken.isExcludedFromFee(sender);
    }
    expect(isSenderExcludedFromFees).to.equal(true, "account should be excluded from fee");

    let isReceiverExcludedFromFees = await tuffToken.isExcludedFromFee(receiver);
    if (!isReceiverExcludedFromFees) {
      await tuffToken.excludeFromFee(receiver);
      isReceiverExcludedFromFees = await tuffToken.isExcludedFromFee(receiver);
    }
    expect(isReceiverExcludedFromFees).to.equal(true, "account should be excluded from fee");

    // Get initial balances of first and second account.
    const senderStartingBalance = parseFloat(await tuffToken.balanceOf(sender));
    const receiverStartingBalance = parseFloat(await tuffToken.balanceOf(receiver));

    // Make transaction from first account to second.
    const amount = 10000000;
    await tuffToken.transfer(receiver, amount, { from: sender });

    // Get balances of first and second account after the transactions.
    const senderEndingBalance = parseFloat(await tuffToken.balanceOf(sender));
    const receiverEndingBalance = parseFloat(await tuffToken.balanceOf(receiver));


    expect(senderEndingBalance).to.equal(senderStartingBalance - amount, "Amount wasn't correctly taken from the sender");
    expect(receiverEndingBalance).to.equal(receiverStartingBalance + amount, "Amount wasn't correctly sent to the receiver");
  });

  it('should send token correctly - sender excluded from fees', async () => {
    // Setup 2 accounts.
    const sender = owner.getAddress();
    const receiver = accounts[1].getAddress();

    let isSenderExcludedFromFees = await tuffToken.isExcludedFromFee(sender);
    if (!isSenderExcludedFromFees) {
      await tuffToken.excludeFromFee(sender);
      isSenderExcludedFromFees = await tuffToken.isExcludedFromFee(sender);
    }
    expect(isSenderExcludedFromFees).to.equal(true, "account should be excluded from fee");

    let isReceiverExcludedFromFees = await tuffToken.isExcludedFromFee(receiver);
    if (isReceiverExcludedFromFees) {
      await tuffToken.includeInFee(receiver);
      isReceiverExcludedFromFees = await tuffToken.isExcludedFromFee(receiver);
    }
    expect(isReceiverExcludedFromFees).to.equal(false, "account should not be excluded from fee");

    // Get initial balances of first and second account.
    const senderStartingBalance = parseFloat(await tuffToken.balanceOf(sender));
    const receiverStartingBalance = parseFloat(await tuffToken.balanceOf(receiver));

    // Make transaction from first account to second.
    const amount = 10000000;
    await tuffToken.transfer(receiver, amount, { from: sender });

    // Get balances of first and second account after the transactions.
    const senderEndingBalance = parseFloat(await tuffToken.balanceOf(sender));
    const receiverEndingBalance = parseFloat(await tuffToken.balanceOf(receiver));


    expect(senderEndingBalance).to.equal(senderStartingBalance - amount, "Amount wasn't correctly taken from the sender");
    expect(receiverEndingBalance).to.equal(receiverStartingBalance + amount, "Amount wasn't correctly sent to the receiver");
  });

  it('should send token correctly - receiver excluded from fees', async () => {
    // Setup 2 accounts.
    const sender = owner.getAddress();
    const receiver = accounts[1].getAddress();

    let isSenderExcludedFromFees = await tuffToken.isExcludedFromFee(sender);
    if (isSenderExcludedFromFees) {
      await tuffToken.includeInFee(sender);
      isSenderExcludedFromFees = await tuffToken.isExcludedFromFee(sender);
    }
    expect(isSenderExcludedFromFees).to.equal(false, "account should not be excluded from fee");

    let isReceiverExcludedFromFees = await tuffToken.isExcludedFromFee(receiver);
    if (!isReceiverExcludedFromFees) {
      await tuffToken.excludeFromFee(receiver);
      isReceiverExcludedFromFees = await tuffToken.isExcludedFromFee(receiver);
    }
    expect(isReceiverExcludedFromFees).to.equal(true, "account should be excluded from fee");

    // Get initial balances of first and second account.
    const senderStartingBalance = parseFloat(await tuffToken.balanceOf(sender));
    const receiverStartingBalance = parseFloat(await tuffToken.balanceOf(receiver));

    // Make transaction from first account to second.
    const amount = 10000000;
    await tuffToken.transfer(receiver, amount, { from: sender });

    // Get balances of first and second account after the transactions.
    const senderEndingBalance = parseFloat(await tuffToken.balanceOf(sender));
    const receiverEndingBalance = parseFloat(await tuffToken.balanceOf(receiver));


    expect(senderEndingBalance).to.equal(senderStartingBalance - amount, "Amount wasn't correctly taken from the sender");
    expect(receiverEndingBalance).to.equal(receiverStartingBalance + amount, "Amount wasn't correctly sent to the receiver");
  });

  it('should send token correctly - both included in fees', async () => {
    const amount = 10000000;

    // Setup sender account
    const sender = accounts[1];
    await tuffToken.includeInFee(sender.getAddress());
    expect(await tuffToken.isExcludedFromFee(sender.getAddress())).to.equal(false, "account should not be excluded from fee");
    // Give sender account tokens to send
    await tuffToken.transfer(sender.getAddress(), amount);
    const senderStartingBalance = parseFloat(await tuffToken.balanceOf(sender.getAddress()));
    expect(senderStartingBalance).to.equal(amount);

    // Setup receiver account
    const receiver = accounts[2];
    await tuffToken.includeInFee(receiver.getAddress());
    expect(await tuffToken.isExcludedFromFee(receiver.getAddress())).to.equal(false, "account should not be excluded from fee");
    const receiverStartingBalance = parseFloat(await tuffToken.balanceOf(receiver.getAddress()));
    expect(receiverStartingBalance).to.equal(0);

    // Make transaction from first account to second
    await tuffToken.connect(sender).transfer(receiver.getAddress(), amount);

    // Get ending balances after transaction
    const senderEndingBalance = parseFloat(await tuffToken.balanceOf(sender.getAddress()));
    const receiverEndingBalance = parseFloat(await tuffToken.balanceOf(receiver.getAddress()));
    const farmTreasuryEndingBalance = parseFloat(await tuffToken.balanceOf(farmTreasury.address));

    // Get fees
    const farmFeeAmount = await tuffToken.calculateFarmFee(amount, true);
    const reflectionFeeAmount = await tuffToken.calculateReflectionFee(amount, true);

    // Then determine if fees were properly taken
    expect(senderEndingBalance).to.equal(senderStartingBalance - amount, "Amount wasn't correctly taken from the sender");
    expect(receiverEndingBalance).to.equal(receiverStartingBalance + amount - farmFeeAmount - reflectionFeeAmount, "Amount wasn't correctly sent to the receiver");
    expect(farmTreasuryEndingBalance).to.equal(farmFeeAmount, "Amount wasn't correctly sent to Farm Treasury");
  });

  it('should send token correctly on behalf of other account', async () => {
    const amount = 100;

    // Setup sender account
    const sender = owner.getAddress();
    await tuffToken.includeInFee(sender);
    expect(await tuffToken.isExcludedFromFee(sender)).to.equal(false, "account should not be excluded from fee");
    const senderStartingBalance = parseFloat(await tuffToken.balanceOf(sender));

    // Setup receiver account
    const receiver = accounts[1].getAddress();
    await tuffToken.includeInFee(receiver);
    expect(await tuffToken.isExcludedFromFee(receiver)).to.equal(false, "account should not be excluded from fee");
    const receiverStartingBalance = parseFloat(await tuffToken.balanceOf(receiver));
    expect(receiverStartingBalance).to.equal(0);

    // Send tokens on behalf of the sender
    await tuffToken.increaseAllowance(sender, amount);
    await tuffToken.transferFrom(sender, receiver, amount);

    // Get ending balances after transaction
    const senderEndingBalance = parseFloat(await tuffToken.balanceOf(sender));
    const receiverEndingBalance = parseFloat(await tuffToken.balanceOf(receiver));
    const farmTreasuryEndingBalance = parseFloat(await tuffToken.balanceOf(farmTreasury.address));

    // Get fees
    const farmFeeAmount = await tuffToken.calculateFarmFee(amount, true);
    const reflectionFeeAmount = await tuffToken.calculateReflectionFee(amount, true);

    // Then determine if fees were properly taken
    expect(senderEndingBalance).to.equal(senderStartingBalance - amount, "Amount wasn't correctly taken from the sender");
    expect(receiverEndingBalance).to.equal(receiverStartingBalance + amount - farmFeeAmount - reflectionFeeAmount, "Amount wasn't correctly sent to the receiver");
    expect(farmTreasuryEndingBalance).to.equal(farmFeeAmount, "Amount wasn't correctly sent to Farm Treasury");
  });
});
