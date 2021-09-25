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
    let election;
    let electionPastEnd;

    before(async function () {
        const { contractOwner } = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.js`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [,, ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function () {
        const { TuffToken, Governance, Election, ElectionPastEnd } = await hre.deployments.fixture();
        tuffToken = await hre.ethers.getContractAt(TuffToken.abi, TuffToken.address, owner);
        governance = await hre.ethers.getContractAt(Governance.abi, Governance.address, owner);
        election = await hre.ethers.getContractAt(Election.abi, Election.address, owner);
        electionPastEnd = await hre.ethers.getContractAt(ElectionPastEnd.abi, ElectionPastEnd.address, owner);
    });

    it("should create an election from governance", async () => {
        const currentTimestamp = Date.now();
        const electionEnd = currentTimestamp + 60000;
        const electionAddress = await governance.createElection("Test Election", "This is a test.", "Ian Ballard", electionEnd);
        expect(electionAddress).to.not.be.null;
    });

    it("should get is holder", async () => {
        let isHolder = await election.isHolder(owner.address);
        expect(isHolder).to.equal(true, "should be holder");

        isHolder = await election.isHolder(accounts[0].address);
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
