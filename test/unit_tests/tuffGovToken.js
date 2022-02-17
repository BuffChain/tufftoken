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

        const {contractOwner} = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.js`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [, , ...accounts] = await hre.ethers.getSigners();
        
        const {TuffTokenDiamond, TuffGovToken, TimelockController, TuffGovernor} = await hre.deployments.fixture();
        tuffTokenDiamond = await hre.ethers.getContractAt(TuffTokenDiamond.abi, TuffTokenDiamond.address, owner);

        tuffGovToken = await hre.ethers.getContractAt(TuffGovToken.abi, TuffGovToken.address, owner);

        timelockController = await hre.ethers.getContractAt(TimelockController.abi, TimelockController.address, owner);

        tuffGovernor = await hre.ethers.getContractAt(TuffGovernor.abi, TuffGovernor.address, owner);
    });

    async function assertTuffWasWrapped() {
        const sender = owner.address;

        const tuffTotalSupply = await tuffTokenDiamond.totalSupply();

        const startingTuffBalance = await tuffTokenDiamond.balanceOf(sender);
        expect(startingTuffBalance).to.equal(tuffTotalSupply, "Unexpected tuff starting balance");

        const startingTuffGovBalance = await tuffGovToken.balanceOf(sender);
        expect(startingTuffGovBalance).to.equal(0, "Unexpected gov starting balance");

        await wrapTuff(sender, startingTuffBalance.toString());

        const tuffBalanceAfterWrap = await tuffTokenDiamond.balanceOf(sender);
        expect(tuffBalanceAfterWrap).to.equal(startingTuffGovBalance, "Unexpected tuff balance after wrap");

        const tuffGovBalanceAfterWrap = await tuffGovToken.balanceOf(sender);
        expect(tuffGovBalanceAfterWrap).to.equal(startingTuffBalance, "Unexpected tuff gov balance after wrap");
        return {sender, startingTuffBalance, startingTuffGovBalance};
    }

    async function assertTuffGovConversions() {
        const {sender, startingTuffBalance, startingTuffGovBalance} = await assertTuffWasWrapped();

        await unWrapTuff(sender, startingTuffBalance.toString());

        const tuffBalanceAfterUnwrap = await tuffTokenDiamond.balanceOf(sender);
        expect(tuffBalanceAfterUnwrap).to.equal(startingTuffBalance, "Unexpected tuff balance after unwrap");

        const tuffGovBalanceAfterUnWrap = await tuffGovToken.balanceOf(sender);
        expect(tuffGovBalanceAfterUnWrap).to.equal(startingTuffGovBalance, "Unexpected tuff gov balance after unwrap");
    }

    it("should conversion between Tuff and TuffGov", async () => {
        await assertTuffGovConversions();
    });

    async function wrapTuff(account, amount) {
        await tuffTokenDiamond.approve(tuffGovToken.address, amount);
        await tuffGovToken.depositFor(account, amount)
    }

    async function unWrapTuff(account, amount) {
        await tuffGovToken.withdrawTo(account, amount)
    }

    // async function wrapTuff(amount) {
    //     await tuffGovToken.wrap(amount)
    // }
    //
    // async function unWrapTuff(amount) {
    //     await tuffGovToken.unWrap(amount)
    // }

    async function assertProposalCreated(description) {
        const tokenAddress = tuffTokenDiamond.address
        const token = await hre.ethers.getContractAt('ERC20', tokenAddress);
        const receiverAccount = accounts[1].address;
        const grantAmount = 100000;
        const transferCalldata = token.interface.encodeFunctionData('transfer', [receiverAccount, grantAmount]);

        const targets = [tokenAddress];
        const values = [0];
        const calldatas = [transferCalldata];

        await tuffGovernor.setVotingDelay(0);

        const proposalTx = await tuffGovernor._propose(
            [tokenAddress],
            [0],
            [transferCalldata],
            description,
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
        const proposalId = await assertProposalCreated("Proposal #1: Give grant to receiver");
    });

    async function assertVoteCast(proposalId) {

        let state = await tuffGovernor.state(proposalId)
        const pendingState = 0;

        state = await tuffGovernor.state(proposalId);
        const activeState = 1;
        expect(state).to.equal(activeState, "Proposal should be in active state");

        await tuffGovernor.castVote(proposalId, 0);

        await expectRevert(tuffGovernor.castVote(proposalId, 1), "GovernorCompatibilityBravo: vote already cast");

    }

    it("should cast vote on proposal", async () => {
        const proposalId = await assertProposalCreated("Proposal #2: Give grant to receiver some more");

        const {sender, startingTuffBalance, startingTuffGovBalance} = await assertTuffWasWrapped();

        await assertVoteCast(proposalId);

        await unWrapTuff(sender, startingTuffBalance)
    });

    it("should get votes weight", async () => {
        const {sender, startingTuffBalance, startingTuffGovBalance} = await assertTuffWasWrapped();

        const latestBlock = (await hre.ethers.provider.getBlock("latest")).number - 1;
        // const weight = await tuffGovToken.getVotes(accounts[0].address);
        const weight = await tuffGovernor.getVotes(accounts[0].address, latestBlock);
        console.log(weight.toString())
        await unWrapTuff(sender, startingTuffBalance)
    });

    it("should get proposal details", async () => {
        const {sender, startingTuffBalance, startingTuffGovBalance} = await assertTuffWasWrapped();

        const proposalId = await assertProposalCreated("Proposal #3: Give grant to receiver again");

        const latestBlock = (await hre.ethers.provider.getBlock("latest")).number - 1;
        const weight = await tuffGovernor.getVotes(accounts[0].address, latestBlock);
        console.log(weight.toString())

        const [id, proposer, eta, startBlock, endBlock, forVotes, againstVotes, abstainVotes, canceled, executed] =
            await tuffGovernor.proposals(proposalId);

        console.log(latestBlock)
        console.log(startBlock.toString())
        console.log(endBlock.toString())
        console.log(forVotes.toString())
        console.log(againstVotes.toString())
        console.log(abstainVotes.toString())

        await unWrapTuff(sender, startingTuffBalance)

    });


});
