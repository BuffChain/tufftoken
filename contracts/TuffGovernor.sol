// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/compatibility/GovernorCompatibilityBravo.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @notice This is the core governance contract that will be used to manage proposals and voting.
/// @dev Implementation of openzepplin governance https://docs.openzeppelin.com/contracts/4.x/governance#governor.
contract TuffGovernor is
    Governor,
    GovernorCompatibilityBravo,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl,
    Ownable
{
    uint256 private _votingDelay;
    uint256 private _votingPeriod;
    uint256 private _proposalThreshold;


    /// @notice The Governor implementation uses GovernorVotesQuorumFraction which works together with ERC20Votes to
    /// define quorum as a percentage of the total supply at the block a proposal's voting power is retrieved (4%).
    /// @dev Quorum Fraction is set to 4%.
    /// @param _token The underlying ERC20 token with voting capabilities.
    /// @param _timelock Allows users to exit the system if they disagree with a decision before it is executed.
    constructor(ERC20Votes _token, TimelockController _timelock)
        Governor("TuffGovernor")
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4)
        GovernorTimelockControl(_timelock)
    {
        _votingDelay = 6575;
        _votingPeriod = 46027;
        _proposalThreshold = 1;
    }

    function votingDelay() public view override returns (uint256) {
        return _votingDelay;
    }

    /// @notice Set voting delay.
    /// @dev Voting Delay is initially set to 1 day.
    /// @param delay The amount of delay after a proposal is created before it can be voted on.
    function setVotingDelay(uint256 delay) public onlyOwner {
        _votingDelay = delay;
    }


    function votingPeriod() public view override returns (uint256) {
        return _votingPeriod;
    }

    /// @notice Set voting period.
    /// @dev Voting Period is initially set to 1 week.
    /// @param period The amount of time a proposal can be voted on.
    function setVotingPeriod(uint256 period) public onlyOwner {
        _votingPeriod = period;
    }

    function proposalThreshold() public view override returns (uint256) {
        return _proposalThreshold;
    }

    /// @notice Set proposal threshold.
    /// @dev Threshold is initially set to 1.
    /// @param threshold How much voting power is needed to create a proposal.
    function setProposalThreshold(uint256 threshold) public onlyOwner {
        _proposalThreshold = threshold;
    }

    /// @notice Minimum number of cast voted required for a proposal to be successful.
    /// @param blockNumber quorum at specified block number
    /// @inheritdoc GovernorVotesQuorumFraction
    function quorum(uint256 blockNumber)
        public
        view
        override(IGovernor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    /// @notice Get votes for an account given a specific block number
    /// @inheritdoc IGovernor
    function getVotes(address account, uint256 blockNumber)
        public
        view
        override(Governor, IGovernor)
        returns (uint256)
    {
        return super.getVotes(account, blockNumber);
    }

    /// @notice Current state of a proposal, following Compound's convention
    /// @inheritdoc GovernorTimelockControl
    function state(uint256 proposalId)
        public
        view
        override(Governor, IGovernor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    /// @notice Create a proposal
    /// @inheritdoc IGovernor
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor, GovernorCompatibilityBravo, IGovernor) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }

    /// @notice Overridden execute function that run the already queued proposal through the timelock.
    /// @inheritdoc Governor
    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    /// @notice Overridden version of the {Governor-_cancel} function to cancel the timelocked proposal if it as already been queued.
    /// @inheritdoc Governor
    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    /// @inheritdoc GovernorTimelockControl
    function _executor() internal view override(Governor, GovernorTimelockControl) returns (address) {
        return super._executor();
    }

    /// @inheritdoc GovernorTimelockControl
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor, IERC165, GovernorTimelockControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /// @notice propose wrapper
    function doPropose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public returns (uint256) {
        return propose(targets, values, calldatas, description);
    }

    /// @notice queue wrapper
    function doQueue(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) public returns (uint256) {
        return super.queue(targets, values, calldatas, descriptionHash);
    }

    /// @notice execute wrapper
    function doExecute(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) public payable returns (uint256) {
        return super.execute(targets, values, calldatas, descriptionHash);
    }

}
