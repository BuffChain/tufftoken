// SPDX-License-Identifier: agpl-3.0

const chai = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);

const { expect } = chai;
const { ethers } = require("hardhat");


describe("Governance", function () {

    let owner;
    let accounts;

    let farmTreasuryFactory;
    let farmTreasury;

    let tuffTokenFactory;
    let tuffToken;

    let governanceFactory;
    let governance;

    let electionFactory;
    let election;
    let electionPastEnd;

    before(async function () {
        tuffTokenFactory = await ethers.getContractFactory("TuffToken");
        governanceFactory = await ethers.getContractFactory("Governance");
        farmTreasuryFactory = await ethers.getContractFactory("FarmTreasury");
        electionFactory = await ethers.getContractFactory("Election");
    });

    beforeEach(async function () {
        [owner, ...accounts] = await ethers.getSigners();

        farmTreasury = await farmTreasuryFactory.deploy();
        await farmTreasury.deployed();

        tuffToken = await tuffTokenFactory.deploy(farmTreasury.address);
        await tuffToken.deployed();

        governance = await governanceFactory.deploy(tuffToken.address);
        await governance.deployed();

        const currentTimestamp = Date.now();
        const electionEnd = currentTimestamp + 60000;
        election = await electionFactory.deploy("Test Election", "This is a test.", "Ian Ballard", electionEnd, tuffToken.address);
        await election.deployed();

        electionPastEnd = await electionFactory.deploy("Test Election 2", "This is a test.", "Ian Ballard", 1, tuffToken.address);
        await electionPastEnd.deployed();

    });

    it("should create an election from governance", async () => {
        const currentTimestamp = Date.now();
        const electionEnd = currentTimestamp + 60000;
        const electionAddress = await governance.createElection("Test Election", "This is a test.", "Ian Ballard", electionEnd);
        expect(electionAddress).to.not.be.null;
    });

    it("should get is holder", async () => {
        let isHolder = await election.isHolder(owner.getAddress());
        expect(isHolder).to.equal(true, "should be holder");

        isHolder = await election.isHolder(accounts[0].getAddress());
        expect(isHolder).to.equal(false, "should not be holder");
    });

    it("should get remaining time", async () => {
        let remainingTime = await election.getRemainingTime();
        expect(remainingTime > 0).to.equal(true, "should have more time");
    });

    it("should vote", async () => {
        await election.vote(true);

        let [approveVotes, vetoVotes] = await election.getVoteCounts();

        expect(approveVotes.toNumber()).to.equal(1, "should have 1 approve votes");
        expect(vetoVotes.toNumber()).to.equal(0, "should have 0 veto votes");
    });

    it("should get vote counts", async () => {
        let [approveVotes, vetoVotes] = await election.getVoteCounts();
        expect(approveVotes.toNumber()).to.equal(0, "should have 0 approve votes");
        expect(vetoVotes.toNumber()).to.equal(0, "should have 0 veto votes");
    });

    it("should get vote outcome", async () => {
        let [outcome, approveVotes, vetoVotes] = await election.isProposalSuccess();
        expect(outcome).to.equal(true, "should have passed");
        expect(approveVotes.toNumber()).to.equal(0, "should have 0 approve votes");
        expect(vetoVotes.toNumber()).to.equal(0, "should have 0 veto votes");
    });

    it("should try to end vote", async () => {
        await electionPastEnd.end();

        let ended = await electionPastEnd.ended();

        expect(ended).to.equal(true, "should have been ended");
    });

});
