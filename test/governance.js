// SPDX-License-Identifier: agpl-3.0

const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");
const utils = require("./utils");

describe("Governance", function () {

    let owner;
    let accounts;

    let tuffToken;
    let governance;

    const expectedName = "Test Election";
    const expectedDescription = "This is a test.";
    const expectedAuthor = "Tuff Guy";

    const currentTimestamp = Date.now();
    const expectedElectionEnd = currentTimestamp + 60000;

    before(async function () {
        const { contractOwner } = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.js`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [,, ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function () {
        const { TuffToken, Governance } = await hre.deployments.fixture();
        tuffToken = await hre.ethers.getContractAt(TuffToken.abi, TuffToken.address, owner);
        governance = await hre.ethers.getContractAt(Governance.abi, Governance.address, owner);

        await governance.createElection(expectedName, expectedDescription, expectedAuthor, expectedElectionEnd);
    });

    it("should get elections length", async () => {
        const electionLength = await governance.getElectionLength();
        expect(electionLength).to.equal(1, "should be length 1");
    });

    it("should create an election from governance", async () => {

        let electionLength = await governance.getElectionLength();
        expect(electionLength).to.equal(1, "should be length 0");

        await governance.createElection(expectedName + 1, expectedDescription, expectedAuthor, expectedElectionEnd);
        electionLength = await governance.getElectionLength();
        expect(electionLength).to.equal(2, "should be length 1");

        const electionIndex = electionLength - 1;
        const [name, description, author, endTime, ended] = await governance.getElectionMetaData(electionIndex);
        expect(name).to.equal(expectedName + 1, "incorrect name");
        expect(description).to.equal(expectedDescription, "incorrect description");
        expect(author).to.equal(expectedAuthor, "incorrect author");
        expect(endTime).to.equal(expectedElectionEnd, "incorrect end");
        expect(ended).to.equal(false, "incorrect status");
    });

    it("should get is holder", async () => {
        let isHolder = await governance.isHolder(owner.address);
        expect(isHolder).to.equal(true, "should be holder");

        isHolder = await governance.isHolder(accounts[0].address);
        expect(isHolder).to.equal(false, "should not be holder");
    });

    it("should get remaining time", async () => {
        let remainingTime = await governance.getRemainingTime(0);
        expect(remainingTime > 0).to.equal(true, "should have more time");
    });

    it("should vote", async () => {

        await governance.vote(0, true);

        let [approveVotes, vetoVotes] = await governance.getVoteCounts(0);

        expect(approveVotes.toNumber()).to.equal(1, "should have 1 approve votes");
        expect(vetoVotes.toNumber()).to.equal(0, "should have 0 veto votes");
    });

    it("should get vote counts", async () => {
        let [approveVotes, vetoVotes] = await governance.getVoteCounts(0);
        expect(approveVotes.toNumber()).to.equal(0, "should have 0 approve votes");
        expect(vetoVotes.toNumber()).to.equal(0, "should have 0 veto votes");
    });

    it("should get vote outcome", async () => {
        let [outcome, approveVotes, vetoVotes] = await governance.isProposalSuccess(0);
        expect(outcome).to.equal(true, "should have passed");
        expect(approveVotes.toNumber()).to.equal(0, "should have 0 approve votes");
        expect(vetoVotes.toNumber()).to.equal(0, "should have 0 veto votes");
    });

    it("should try to end vote", async () => {
        const expectedElectionEnd = 0;
        await governance.createElection(expectedName + 2, expectedDescription, expectedAuthor, expectedElectionEnd);

        await governance.endElection(1);

        const [name, description, author, endTime, ended] = await governance.getElectionMetaData(1);

        expect(ended).to.equal(true, "should have been ended");
    });

});
