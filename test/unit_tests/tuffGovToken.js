// SPDX-License-Identifier: agpl-3.0

const {expect} = require("chai");
const hre = require("hardhat");
const {mineBlock} = require("../../utils/back_test_utils");
const {
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');
const utils = require("../../utils/test_utils");

describe("TuffGovToken", function () {

    let owner;
    let accounts;

    let tuffTokenDiamond;
    let tuffGovToken;

    before(async function () {

        const {contractOwner} = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.ts`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [, , ...accounts] = await hre.ethers.getSigners();
        
        const {TuffTokenDiamond, TuffGovToken} = await hre.deployments.fixture();
        tuffTokenDiamond = await hre.ethers.getContractAt(TuffTokenDiamond.abi, TuffTokenDiamond.address, owner);

        tuffGovToken = await hre.ethers.getContractAt(TuffGovToken.abi, TuffGovToken.address, owner);

    });

    async function assertTuffWasWrapped(account, amount) {

        const startingTuffBalance = await tuffTokenDiamond.balanceOf(account);
        expect(startingTuffBalance).to.equal(amount, "Unexpected tuff starting balance");

        const startingTuffGovBalance = await tuffGovToken.balanceOf(account);
        expect(startingTuffGovBalance).to.equal(0, "Unexpected gov starting balance");

        await utils.wrapTuffToGov(tuffTokenDiamond, tuffGovToken, amount.toString());

        const tuffBalanceAfterWrap = await tuffTokenDiamond.balanceOf(account);
        expect(tuffBalanceAfterWrap).to.equal(startingTuffGovBalance, "Unexpected tuff balance after wrap");

        const tuffGovBalanceAfterWrap = await tuffGovToken.balanceOf(account);
        expect(tuffGovBalanceAfterWrap).to.equal(startingTuffBalance, "Unexpected tuff gov balance after wrap");

    }

    async function assertTuffGovConversions() {

        const sender = owner.address;
        const startingTuffBalance = await tuffTokenDiamond.balanceOf(sender);
        const startingTuffGovBalance = await tuffGovToken.balanceOf(sender);

        await assertTuffWasWrapped(sender, startingTuffBalance);

        await utils.unwrapGovToTuff(tuffGovToken, startingTuffBalance.toString());

        const tuffBalanceAfterUnwrap = await tuffTokenDiamond.balanceOf(sender);
        expect(tuffBalanceAfterUnwrap).to.equal(startingTuffBalance, "Unexpected tuff balance after unwrap");

        const tuffGovBalanceAfterUnWrap = await tuffGovToken.balanceOf(sender);
        expect(tuffGovBalanceAfterUnWrap).to.equal(startingTuffGovBalance, "Unexpected tuff gov balance after unwrap");
    }

    it("should conversion between Tuff and TuffGov", async () => {
        await assertTuffGovConversions();
    });

    it("should modify voting power", async () => {

        const sender = owner.address;
        const tuffBalance = await tuffTokenDiamond.balanceOf(sender);

        let isExcludedFromFee = await tuffTokenDiamond.isExcludedFromFee(sender);

        expect(isExcludedFromFee).to.equal(true, "Should be excluded from fee");

        await tuffTokenDiamond.includeInFee(sender);

        isExcludedFromFee = await tuffTokenDiamond.isExcludedFromFee(sender);

        expect(isExcludedFromFee).to.equal(false, "Should not be excluded from fee");

        await assertTuffWasWrapped(sender, tuffBalance);

        let delegate = await tuffGovToken.delegates(sender);

        const zeroAddress = '0x0000000000000000000000000000000000000000'
        expect(delegate).to.equal(zeroAddress, "Should not have delegate set");

        let checkPoints = await tuffGovToken.numCheckpoints(sender);
        expect(checkPoints).to.equal(0, "Should not have reached any checkpoints");

        let weight = await tuffGovToken.getVotes(sender);
        expect(weight).to.equal(0, "Should not have any voting power");

        await tuffGovToken.delegate(sender);

        delegate = await tuffGovToken.delegates(sender);
        expect(delegate).to.equal(sender, "Should have delegated self");

        checkPoints = await tuffGovToken.numCheckpoints(sender);
        expect(checkPoints).to.equal(1, "Should have reached checkpoint");

        weight = await tuffGovToken.getVotes(sender);
        expect(weight).to.equal(tuffBalance.toString(), "Should have voting power equal to balance of wrapped token");

        await utils.unwrapGovToTuff(tuffGovToken, tuffBalance)

        weight = await tuffGovToken.getVotes(sender);
        expect(weight).to.equal(0, "Should not have any voting power");

    });


});
