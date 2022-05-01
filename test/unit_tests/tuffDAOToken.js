// SPDX-License-Identifier: agpl-3.0

const {expect} = require("chai");
const hre = require("hardhat");
const {mineBlock} = require("../../utils/back_test_utils");
const {
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');
const utils = require("../../utils/test_utils");

describe("TuffDAOToken", function () {

    let owner;
    let accounts;

    let tuffDAOToken;

    before(async function () {

        const {contractOwner} = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.ts`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [, , ...accounts] = await hre.ethers.getSigners();

        const {TuffDAOToken} = await hre.deployments.fixture();

        tuffDAOToken = await hre.ethers.getContractAt(TuffDAOToken.abi, TuffDAOToken.address, owner);

    });


    it("should modify voting power", async () => {

        const sender = owner.address;
        const tuffDAOBalance = await tuffDAOToken.balanceOf(sender);
        expect(tuffDAOBalance > 0).to.equal(true, "Should have a positive TuffDAO balance.");

        let delegate = await tuffDAOToken.delegates(sender);
        expect(delegate).to.equal(hre.ethers.constants.AddressZero, "Should not have delegate set");

        let checkPoints = await tuffDAOToken.numCheckpoints(sender);
        expect(checkPoints).to.equal(0, "Should not have reached any checkpoints");

        let weight = await tuffDAOToken.getVotes(sender);
        expect(weight).to.equal(0, "Should not have any voting power");

        await tuffDAOToken.delegate(sender);

        delegate = await tuffDAOToken.delegates(sender);
        expect(delegate).to.equal(sender, "Should have delegated self");

        checkPoints = await tuffDAOToken.numCheckpoints(sender);
        expect(checkPoints).to.equal(1, "Should have reached checkpoint");

        weight = await tuffDAOToken.getVotes(sender);
        expect(weight).to.equal(tuffDAOBalance.toString(), "Should have voting power equal to balance of DAO token");

        await tuffDAOToken.delegate(hre.ethers.constants.AddressZero);

        weight = await tuffDAOToken.getVotes(sender);
        expect(weight).to.equal(0, "Should not have any voting power");

    });


});
