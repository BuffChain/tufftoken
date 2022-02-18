// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/compatibility/GovernorCompatibilityBravo.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

/**
 * Implementation of openzepplin governance https://docs.openzeppelin.com/contracts/4.x/governance#governor
 */

contract TuffGovernor is
    Governor,
    GovernorCompatibilityBravo,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{

    uint256 _votingDelay;
    uint256 _votingPeriod;
    uint256 _proposalThreshold;

    constructor(ERC20Votes _token, TimelockController _timelock)
        Governor("TuffGovernor")
        GovernorVotes(_token)

        // GovernorVotesQuorumFraction which works together with ERC20Votes to define quorum as a percentage of
        // the total supply at the block a proposal’s voting power is retrieved. (4%)
        GovernorVotesQuorumFraction(4)

        GovernorTimelockControl(_timelock)
    {
        _votingDelay = 6575; // 1 day
        _votingPeriod = 46027;  // 1 week
        _proposalThreshold = 0; // how much voting power is needed to create a proposal
    }

    function votingDelay() public view override returns (uint256) {
        return _votingDelay;
    }

    function setVotingDelay(uint256 delay) public {
        _votingDelay = delay;
    }

    function votingPeriod() public view override returns (uint256) {
        return _votingPeriod;
    }

    function setVotingPeriod(uint256 period) public {
        _votingPeriod = period;
    }

    function proposalThreshold() public view override returns (uint256) {
        return _proposalThreshold;
    }

    function setProposalThreshold(uint256 threshold) public {
        _proposalThreshold = threshold;
    }

    // The functions below are overrides required by Solidity.

    function quorum(uint256 blockNumber)
        public
        view
        override(IGovernor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function getVotes(address account, uint256 blockNumber)
        public
        view
        override(IGovernor, GovernorVotes)
        returns (uint256)
    {
        return super.getVotes(account, blockNumber);
    }

    function state(uint256 proposalId)
        public
        view
        override(Governor, IGovernor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    )
        public
        override(Governor, GovernorCompatibilityBravo, IGovernor)
        returns (uint256)
    {
        return super.propose(targets, values, calldatas, description);
    }

    function _propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    )
        public
        returns (
            //        override(Governor, GovernorCompatibilityBravo, IGovernor)
            uint256
        )
    {
        return super.propose(targets, values, calldatas, description);
    }

    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor, IERC165, GovernorTimelockControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
