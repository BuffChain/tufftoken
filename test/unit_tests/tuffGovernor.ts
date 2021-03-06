// SPDX-License-Identifier: agpl-3.0

import hre from "hardhat";
import { BigNumber } from "ethers";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TuffToken, TuffGovernor, TimelockController } from "../../src/types";

import {
    getERC20Contract
} from "../../utils/utils";
import {
    mineBlock
} from "../../utils/test_utils";

const { expectRevert } = require("@openzeppelin/test-helpers");

describe("TuffGovernor", function() {

    let owner: SignerWithAddress;
    let accounts: SignerWithAddress[];

    let tuffToken: TuffToken;
    let tuffGovernor: TuffGovernor;
    let timelockController: TimelockController;

    let startingOwnerTuffDAOBal: BigNumber;

    before(async function() {

        const { contractOwner } = await hre.getNamedAccounts();
        owner = await hre.ethers.getSigner(contractOwner);

        //Per `hardhat.config.ts`, the 0 and 1 index accounts are named accounts. They are reserved for deployment uses
        [, , ...accounts] = await hre.ethers.getSigners();

        const { TuffToken, TimelockController, TuffGovernor } = await hre.deployments.fixture();
        tuffToken = await hre.ethers.getContractAt(TuffToken.abi, TuffToken.address, owner) as TuffToken;
        timelockController = await hre.ethers.getContractAt(TimelockController.abi, TimelockController.address, owner) as TimelockController;
        tuffGovernor = await hre.ethers.getContractAt(TuffGovernor.abi, TuffGovernor.address, owner) as TuffGovernor;

        await tuffToken.delegate(owner.address);

        startingOwnerTuffDAOBal = await tuffToken.balanceOf(owner.address);
    });

    async function assertProposalCreated(description: string) {
        const tokenAddress = tuffToken.address;
        const token = await getERC20Contract(tokenAddress);
        const calldata = token.interface.encodeFunctionData("name", []);

        const targets = [tokenAddress];
        const values = [0];

        const calldatas = [calldata];

        await tuffGovernor.setVotingDelay(0);

        const proposalTx = await tuffGovernor.doPropose(
            [tokenAddress],
            [0],
            calldatas,
            description
        );

        const proposalReceipt = await proposalTx.wait();
        expect(proposalReceipt.events).to.have.lengthOf.greaterThan(0);

        // @ts-ignore: length is asserted above
        const proposalCreatedEvent = proposalReceipt.events.find(event => event.event === "ProposalCreated");
        const emittedProposalId = proposalCreatedEvent?.args?.proposalId.toString();

        const descriptionHash = hre.ethers.utils.id(description);
        const proposalId = await tuffGovernor.hashProposal(targets, values, calldatas, descriptionHash);

        expect(emittedProposalId).to.equal(proposalId, "Unexpected proposal id");
        return { proposalId, targets, values, calldatas, descriptionHash };
    }

    it("should create proposal", async () => {
        const { proposalId } = await assertProposalCreated("Proposal #1: Give grant to receiver");
    });

    async function assertVoteCast(proposalId: BigNumber) {
        let state = await tuffGovernor.state(proposalId);
        const pendingState = 0;
        expect(state).to.equal(pendingState, "Proposal should be in pending state");

        await mineBlock();

        state = await tuffGovernor.state(proposalId);
        const activeState = 1;
        expect(state).to.equal(activeState, "Proposal should be in active state");

        await tuffGovernor.castVote(proposalId, 0);

        await expectRevert(tuffGovernor.castVote(proposalId, 1), "GovernorCompatibilityBravo: vote already cast");
    }

    it("should cast vote on proposal", async () => {
        const { proposalId } = await assertProposalCreated("Proposal #2: Give grant to receiver some more");

        await assertVoteCast(proposalId);

    });

    it("should execute proposal", async () => {

        await tuffGovernor.setVotingPeriod(3);

        const { proposalId, targets, values, calldatas, descriptionHash } =
            await assertProposalCreated("Proposal #3: Give grant to receiver again");

        let state = await tuffGovernor.state(proposalId);
        const pendingState = 0;
        expect(state).to.equal(pendingState, "Proposal should be in pending state");

        await mineBlock();

        state = await tuffGovernor.state(proposalId);
        const activeState = 1;
        expect(state).to.equal(activeState, "Proposal should be in active state");

        const forVote = 1;
        const againstVote = 0;
        const abstainVote = 2;
        const unknownVote = 3;

        await expectRevert(tuffGovernor.castVote(proposalId, unknownVote), "GovernorCompatibilityBravo: invalid vote type");

        await tuffGovernor.castVote(proposalId, forVote);

        const [id, proposer, eta, startBlock, endBlock, forVotes, againstVotes, abstainVotes, canceled, executed] =
            await tuffGovernor.proposals(proposalId);

        const holderVotingPower = await tuffToken.getVotes(owner.address);
        const govBal = await tuffToken.balanceOf(owner.address);

        expect(govBal.toString()).to.equal(startingOwnerTuffDAOBal, "Gov token balance should be equal to native token");
        expect(holderVotingPower).to.equal(govBal, "Voting power should equal token balance");

        expect(forVotes).to.equal(holderVotingPower, "Votes 'for' should equal sender's voting power");

        state = await expireVotingPeriod(proposalId);
        const succeededState = 4;
        expect(state).to.equal(succeededState, "Proposal should have succeeded");

        await tuffGovernor.doQueue(targets, values, calldatas, descriptionHash);

        state = await tuffGovernor.state(proposalId);
        const queuedState = 5;
        expect(state).to.equal(queuedState, "Proposal should have been queued");

        await tuffGovernor.doExecute(targets, values, calldatas, descriptionHash);

        state = await tuffGovernor.state(proposalId);
        const executedState = 7;
        expect(state).to.equal(executedState, "Proposal should have been executed");

    });

    async function expireVotingPeriod(proposalId: BigNumber) {
        let state = await tuffGovernor.state(proposalId);
        while (state === 1) {
            await mineBlock();
            state = await tuffGovernor.state(proposalId);
        }
        return state;
    }

    it("should fail due to only owner check", async () => {
        await tuffGovernor.setVotingPeriod(1);
        let votingPeriod = await tuffGovernor.votingPeriod();
        expect(votingPeriod).to.equal(1, "unexpected voting period");

        const nonOwnerAccountAddress = accounts[1].address;
        await tuffGovernor.transferOwnership(nonOwnerAccountAddress);

        await expectRevert(tuffGovernor.setVotingPeriod(2),
            "Ownable: caller is not the owner");

        votingPeriod = await tuffGovernor.votingPeriod();
        expect(votingPeriod).to.equal(1, "voting period should be left unchanged");
    });
});
