// SPDX-License-Identifier: agpl-3.0

const {expect} = require("chai");
const hre = require("hardhat");

describe("Governance", function () {

    let owner;
    let accounts;

    let tuffTokenDiamond;
    
    const expectedName = "Test Election";
    const expectedDescription = "This is a test.";
    const expectedAuthor = "Tuff Guy";

    const currentTimestamp = Date.now();
    const expectedElectionEnd = currentTimestamp + 60000;

    before(async function () {
        const {contractOwner} = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.js`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [, , ...accounts] = await hre.ethers.getSigners();
    });

    beforeEach(async function () {
        const {TuffTokenDiamond} = await hre.deployments.fixture();
        tuffTokenDiamond = await hre.ethers.getContractAt(TuffTokenDiamond.abi, TuffTokenDiamond.address, owner);

        await tuffTokenDiamond.createElection(expectedName, expectedDescription, expectedAuthor, expectedElectionEnd);
    });

    it("should get elections length", async () => {
        const electionLength = await tuffTokenDiamond.getElectionLength();
        expect(electionLength).to.equal(1, "should be length 1");
    });

    it("should create an election from governance", async () => {

        let electionLength = await tuffTokenDiamond.getElectionLength();
        expect(electionLength).to.equal(1, "should be length 1");

        const newElectionName = expectedName + 1;
        const newElectionIndex = electionLength;

        await expect(tuffTokenDiamond.createElection(newElectionName, expectedDescription, expectedAuthor, expectedElectionEnd))
            .to.emit(tuffTokenDiamond, "ElectionCreated")
            .withArgs(newElectionIndex, newElectionName);


        electionLength = await tuffTokenDiamond.getElectionLength();
        expect(electionLength).to.equal(2, "should be length 2");

        const electionIndex = electionLength - 1;
        const [name, description, author, endTime, ended] = await tuffTokenDiamond.getElectionMetaData(electionIndex);
        expect(name).to.equal(expectedName + 1, "incorrect name");
        expect(description).to.equal(expectedDescription, "incorrect description");
        expect(author).to.equal(expectedAuthor, "incorrect author");
        expect(endTime).to.equal(expectedElectionEnd, "incorrect end");
        expect(ended).to.equal(false, "incorrect status");
    });

    it("should get remaining time", async () => {
        let remainingTime = await tuffTokenDiamond.getRemainingTime(0);
        expect(remainingTime > 0).to.equal(true, "should have more time");
    });

    it("should vote", async () => {

        await tuffTokenDiamond.vote(0, true);

        let [approveVotes, vetoVotes] = await tuffTokenDiamond.getVoteCounts(0);

        expect(approveVotes.toNumber()).to.equal(1, "should have 1 approve votes");
        expect(vetoVotes.toNumber()).to.equal(0, "should have 0 veto votes");
    });

    it("should get vote counts", async () => {
        let [approveVotes, vetoVotes] = await tuffTokenDiamond.getVoteCounts(0);
        expect(approveVotes.toNumber()).to.equal(0, "should have 0 approve votes");
        expect(vetoVotes.toNumber()).to.equal(0, "should have 0 veto votes");
    });

    it("should get vote outcome", async () => {
        let [outcome, approveVotes, vetoVotes] = await tuffTokenDiamond.isProposalSuccess(0);
        expect(outcome).to.equal(true, "should have passed");
        expect(approveVotes.toNumber()).to.equal(0, "should have 0 approve votes");
        expect(vetoVotes.toNumber()).to.equal(0, "should have 0 veto votes");
    });

    it("should try to end vote", async () => {
        const expectedElectionEnd = 0;

        const expectedElectionName = expectedName + 2;

        await tuffTokenDiamond.createElection(expectedElectionName, expectedDescription, expectedAuthor, expectedElectionEnd);

        const expectedElectionIndex = 1;
        const expectedElectionOutcome = true;

        await expect(tuffTokenDiamond.endElection(expectedElectionIndex))
            .to.emit(tuffTokenDiamond, "ElectionEnded")
            .withArgs(expectedElectionIndex, expectedElectionName, expectedElectionOutcome);

        const [name, description, author, endTime, ended] = await tuffTokenDiamond.getElectionMetaData(1);

        expect(ended).to.equal(true, "should have been ended");
    });

});
