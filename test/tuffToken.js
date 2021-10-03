// SPDX-License-Identifier: agpl-3.0

const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");
const utils = require("./utils");

describe("TuffToken", function () {

  let owner;
  let accounts;

  let aaveLPManager;
  let farmTreasury;
  let tuffToken;

  before(async function () {
    const { contractOwner } = await hre.getNamedAccounts();
    owner = await hre.ethers.getSigner(contractOwner);

    //Per `hardhat.config.js`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
    [,, ...accounts] = await hre.ethers.getSigners();
  });

  beforeEach(async function () {
    const { AaveLPManager, FarmTreasury, TuffToken } = await hre.deployments.fixture();
    aaveLPManager = await hre.ethers.getContractAt(AaveLPManager.abi, AaveLPManager.address, owner);
    farmTreasury = await hre.ethers.getContractAt(FarmTreasury.abi, FarmTreasury.address, owner);
    tuffToken = await hre.ethers.getContractAt(TuffToken.abi, TuffToken.address, owner);
  });

  it('should get FarmTreasury address', async () => {
    const address = await tuffToken.getFarmTreasuryAddr();
    expect(address).to.equal(farmTreasury.address, "get FarmTreasury address should be equal to FarmTreasury address");
  });

  it('should calculate farm fee amount with take fee true', async () => {
    const feeAmount = await tuffToken.calculateFarmFee(100, true);
    expect(feeAmount).to.equal(10, "incorrect farm fee amount");
  });

  it('should calculate farm fee amount with take fee false', async () => {
    const feeAmount = await tuffToken.calculateFarmFee(100, false);
    expect(feeAmount).to.equal(0, "incorrect farm fee amount");
  });

  it('should exclude from fees', async () => {
    await tuffToken.excludeFromFee(accounts[0].address);
    expect(await tuffToken.isExcludedFromFee(accounts[0].address)).to.equal(true, "account should be excluded from fee");
  });

  it('should include in fees', async () => {
    await tuffToken.includeInFee(accounts[0].address);
    expect(await tuffToken.isExcludedFromFee(accounts[0].address)).to.equal(false, "account should be included in fee");
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
    const balance = parseFloat(await tuffToken.balanceOf(owner.address));
    expect(balance).to.equal(1000000000 * 10**9, "tokens weren't in the owner account");
  });

  it('should initialize and get allowance', async () => {
    const startingAllowance = parseFloat(await tuffToken.allowance(owner.address, accounts[0].address));
    expect(startingAllowance).to.equal(0, "incorrect starting allowance");

    const approved = Boolean(await tuffToken.approve(accounts[0].address, 100));
    expect(approved).to.equal(true, "should be approved");

    const endingAllowance = parseFloat(await tuffToken.allowance(owner.address, accounts[0].address));
    expect(endingAllowance).to.equal(100, "incorrect ending allowance");
  });

  it('should change allowance', async () => {
    const startingAllowance = parseFloat(await tuffToken.allowance(owner.address, accounts[1].address));
    expect(startingAllowance).to.equal(0, "incorrect starting allowance");

    let approved = Boolean(await tuffToken.increaseAllowance(accounts[1].address, 100));
    expect(approved).to.equal(true, "should be approved");

    const allowance = parseFloat(await tuffToken.allowance(owner.address, accounts[1].address));
    expect(allowance).to.equal(100, "incorrect allowance");

    approved = Boolean(await tuffToken.decreaseAllowance(accounts[1].address, 100));
    expect(approved).to.equal(true, "should be approved");

    const endingAllowance = parseFloat(await tuffToken.allowance(owner.address, accounts[1].address));
    expect(endingAllowance).to.equal(0, "incorrect allowance");
  });

  it('should get fee exclusion', async () => {
    let isExcluded = await tuffToken.isExcludedFromFee(accounts[2].address);
    expect(isExcluded).to.equal(false, "should be included");

    await tuffToken.excludeFromFee(accounts[2].address)

    isExcluded = await tuffToken.isExcludedFromFee(accounts[2].address);
    expect(isExcluded).to.equal(true, "should be excluded");

    await tuffToken.includeInFee(accounts[2].address);

    isExcluded = await tuffToken.isExcludedFromFee(accounts[2].address);
    expect(isExcluded).to.equal(false, "should be included");
  });

  it('should send token correctly - both excluded from fees', async () => {
    // Setup 2 accounts.
    const sender = owner.address;
    const receiver = accounts[0].address;

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
    const sender = owner.address;
    const receiver = accounts[0].address;

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
    const sender = owner.address;
    const receiver = accounts[0].address;

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
    const sender = accounts[0];
    await tuffToken.includeInFee(sender.address);
    expect(await tuffToken.isExcludedFromFee(sender.address)).to.equal(false, "account should not be excluded from fee");
    // Give sender account tokens to send
    await tuffToken.transfer(sender.address, amount);
    const senderStartingBalance = parseFloat(await tuffToken.balanceOf(sender.address));
    expect(senderStartingBalance).to.equal(amount);

    // Setup receiver account
    const receiver = accounts[1];
    await tuffToken.includeInFee(receiver.address);
    expect(await tuffToken.isExcludedFromFee(receiver.address)).to.equal(false, "account should not be excluded from fee");
    const receiverStartingBalance = parseFloat(await tuffToken.balanceOf(receiver.address));
    expect(receiverStartingBalance).to.equal(0);

    // Make transaction from first account to second
    await tuffToken.connect(sender).transfer(receiver.address, amount);

    // Get ending balances after transaction
    const senderEndingBalance = parseFloat(await tuffToken.balanceOf(sender.address));
    const receiverEndingBalance = parseFloat(await tuffToken.balanceOf(receiver.address));
    const farmTreasuryEndingBalance = parseFloat(await tuffToken.balanceOf(farmTreasury.address));

    // Get fees
    const farmFeeAmount = await tuffToken.calculateFarmFee(amount, true);

    // Then determine if fees were properly taken
    expect(senderEndingBalance).to.equal(senderStartingBalance - amount, "Amount wasn't correctly taken from the sender");
    expect(receiverEndingBalance).to.equal(receiverStartingBalance + amount - farmFeeAmount, "Amount wasn't correctly sent to the receiver");
    expect(farmTreasuryEndingBalance).to.equal(farmFeeAmount, "Amount wasn't correctly sent to Farm Treasury");
  });

  it('should send token correctly on behalf of other account', async () => {
    const amount = 100;

    // Setup sender account
    const sender = owner.address;
    await tuffToken.includeInFee(sender);
    expect(await tuffToken.isExcludedFromFee(sender)).to.equal(false, "account should not be excluded from fee");
    const senderStartingBalance = parseFloat(await tuffToken.balanceOf(sender));

    // Setup receiver account
    const receiver = accounts[0].address;
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

    // Then determine if fees were properly taken
    expect(senderEndingBalance).to.equal(senderStartingBalance - amount, "Amount wasn't correctly taken from the sender");
    expect(receiverEndingBalance).to.equal(receiverStartingBalance + amount - farmFeeAmount, "Amount wasn't correctly sent to the receiver");
    expect(farmTreasuryEndingBalance).to.equal(farmFeeAmount, "Amount wasn't correctly sent to Farm Treasury");
  });
});
