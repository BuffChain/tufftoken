// SPDX-License-Identifier: agpl-3.0

const {expect} = require("chai");
const hre = require("hardhat");
const {mineBlock} = require("../../utils/back_test_utils");
const {
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

describe("TuffGovToken", function () {

    let owner;
    let accounts;

    let tuffTokenDiamond;

    let tuffGovTokenFactory;
    let tuffGovToken;

    let tuffGovernorFactory;
    let tuffGovernor;

    let timelockControllerFactory;
    let timelockController;

    before(async function () {
        tuffGovTokenFactory = await hre.ethers.getContractFactory("TuffGovToken");
        tuffGovernorFactory = await hre.ethers.getContractFactory("TuffGovernor");
        timelockControllerFactory = await hre.ethers.getContractFactory("TimelockController");
    });

    beforeEach(async function () {
        [owner, ...accounts] = await ethers.getSigners();

        const {TuffTokenDiamond, TuffGovernor} = await hre.deployments.fixture();
        tuffTokenDiamond = await hre.ethers.getContractAt(TuffTokenDiamond.abi, TuffTokenDiamond.address, owner);

        tuffGovToken = await tuffGovTokenFactory.deploy(tuffTokenDiamond.address);
        await tuffGovToken.deployed();

        timelockController = await timelockControllerFactory.deploy(60, [owner.address], [owner.address]);
        await tuffGovToken.deployed();

        tuffGovernor = await tuffGovernorFactory.deploy(tuffGovToken.address, timelockController.address);
        await tuffGovernor.deployed();
    });

    async function assertProposalCreated() {
        const tokenAddress = tuffTokenDiamond.address
        const token = await hre.ethers.getContractAt('ERC20', tokenAddress);
        const receiverAccount = accounts[1].address;
        const grantAmount = 100000;
        const transferCalldata = token.interface.encodeFunctionData('transfer', [receiverAccount, grantAmount]);

        const targets = [tokenAddress];
        const values = [0];
        const calldatas = [transferCalldata];
        const description = "Proposal #1: Give grant to receiver";

        await tuffGovernor.setVotingDelay(0);

        const proposalTx = await tuffGovernor._propose(
            [tokenAddress],
            [0],
            [transferCalldata],
            "Proposal #1: Give grant to receiver",
        );

        const proposalReceipt = await proposalTx.wait();
        const proposalCreatedEvent = proposalReceipt.events.find(event => event.event === 'ProposalCreated');

        const emittedProposalId = proposalCreatedEvent.args[0].toString()

        const descriptionHash = hre.ethers.utils.id(description);
        const proposalId = await tuffGovernor.hashProposal(targets, values, calldatas, descriptionHash);

        expect(emittedProposalId).to.equal(proposalId, "Unexpected proposal id");
        return proposalId;
    }

    it("should create proposal", async () => {
        const proposalId = await assertProposalCreated();
    });

    async function assertVoteCast(proposalId) {
        let state = await tuffGovernor.state(proposalId)
        const pendingState = 0;

        expect(state).to.equal(pendingState, "Proposal should be in pending state");

        mineBlock()

        const latestBlock = (await hre.ethers.provider.getBlock("latest")).number;

        state = await tuffGovernor.state(proposalId);
        const activeState = 1;
        expect(state).to.equal(activeState, "Proposal should be in active state");

        await tuffGovernor.castVote(proposalId, 0);

        await expectRevert(tuffGovernor.castVote(proposalId, 1), "GovernorCompatibilityBravo: vote already cast");

        return latestBlock;
    }

    it("should cast vote on proposal", async () => {
        const proposalId = await assertProposalCreated();
        await assertVoteCast(proposalId);
    });

    it("should get votes weight", async () => {
        const latestBlock = (await hre.ethers.provider.getBlock("latest")).number - 1;
        // const weight = await tuffGovToken.getVotes(accounts[0].address);
        const weight = await tuffGovToken.tuffGovernor(accounts[0].address, latestBlock);
        console.log(weight.toString())
    });

    it("should get proposal details", async () => {
        const proposalId = await assertProposalCreated();
        const latestBlock = await assertVoteCast(proposalId);

        const [id, proposer, eta, startBlock, endBlock, forVotes, againstVotes, abstainVotes, canceled, executed] =
            await tuffGovernor.proposals(proposalId);

        console.log(latestBlock)
        console.log(startBlock.toString())
        console.log(endBlock.toString())
        console.log(forVotes.toString())
        console.log(againstVotes.toString())
        console.log(abstainVotes.toString())

    });

    //
    // it("should create an election from governance", async () => {
    //
    //     let electionLength = await tuffTokenDiamond.getElectionLength();
    //     expect(electionLength).to.equal(1, "should be length 1");
    //
    //     const newElectionName = expectedName + 1;
    //     const newElectionIndex = electionLength;
    //
    //     await expect(tuffTokenDiamond.createElection(newElectionName, expectedDescription, expectedAuthor, expectedElectionEnd))
    //         .to.emit(tuffTokenDiamond, "ElectionCreated")
    //         .withArgs(newElectionIndex, newElectionName);
    //
    //
    //     electionLength = await tuffTokenDiamond.getElectionLength();
    //     expect(electionLength).to.equal(2, "should be length 2");
    //
    //     const electionIndex = electionLength - 1;
    //     const [name, description, author, endTime, ended] = await tuffTokenDiamond.getElectionMetaData(electionIndex);
    //     expect(name).to.equal(expectedName + 1, "incorrect name");
    //     expect(description).to.equal(expectedDescription, "incorrect description");
    //     expect(author).to.equal(expectedAuthor, "incorrect author");
    //     expect(endTime).to.equal(expectedElectionEnd, "incorrect end");
    //     expect(ended).to.equal(false, "incorrect status");
    // });
    //
    // it("should get remaining time", async () => {
    //     let remainingTime = await tuffTokenDiamond.getRemainingTime(0);
    //     expect(remainingTime > 0).to.equal(true, "should have more time");
    // });
    //
    // it("should vote", async () => {
    //
    //     await tuffTokenDiamond.vote(0, true);
    //
    //     let [approveVotes, vetoVotes] = await tuffTokenDiamond.getVoteCounts(0);
    //
    //     expect(approveVotes.toNumber()).to.equal(1, "should have 1 approve votes");
    //     expect(vetoVotes.toNumber()).to.equal(0, "should have 0 veto votes");
    // });
    //
    // it("should get vote counts", async () => {
    //     let [approveVotes, vetoVotes] = await tuffTokenDiamond.getVoteCounts(0);
    //     expect(approveVotes.toNumber()).to.equal(0, "should have 0 approve votes");
    //     expect(vetoVotes.toNumber()).to.equal(0, "should have 0 veto votes");
    // });
    //
    // it("should get vote outcome", async () => {
    //     let [outcome, approveVotes, vetoVotes] = await tuffTokenDiamond.isProposalSuccess(0);
    //     expect(outcome).to.equal(true, "should have passed");
    //     expect(approveVotes.toNumber()).to.equal(0, "should have 0 approve votes");
    //     expect(vetoVotes.toNumber()).to.equal(0, "should have 0 veto votes");
    // });
    //
    // it("should try to end vote", async () => {
    //     const expectedElectionEnd = 0;
    //
    //     const expectedElectionName = expectedName + 2;
    //
    //     await tuffTokenDiamond.createElection(expectedElectionName, expectedDescription, expectedAuthor, expectedElectionEnd);
    //
    //     const expectedElectionIndex = 1;
    //     const expectedElectionOutcome = true;
    //
    //     await expect(tuffTokenDiamond.endElection(expectedElectionIndex))
    //         .to.emit(tuffTokenDiamond, "ElectionEnded")
    //         .withArgs(expectedElectionIndex, expectedElectionName, expectedElectionOutcome);
    //
    //     const [name, description, author, endTime, ended] = await tuffTokenDiamond.getElectionMetaData(1);
    //
    //     expect(ended).to.equal(true, "should have been ended");
    // });

});
