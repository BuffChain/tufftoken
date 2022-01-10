// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-v8/utils/math/SafeMath.sol";
import "@openzeppelin/contracts-v8/token/ERC20/IERC20.sol";
import {GovernanceLib} from "./GovernanceLib.sol";

contract Governance {
    modifier governanceInitLock() {
        require(
            isGovernanceInit(),
            string(
                abi.encodePacked(GovernanceLib.NAMESPACE, ": ", "UNINITIALIZED")
            )
        );
        _;
    }

    //TODO: Is this needed?
    using SafeMath for uint256;

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initGovernance() public {
        require(
            !isGovernanceInit(),
            string(
                abi.encodePacked(
                    GovernanceLib.NAMESPACE,
                    ": ",
                    "ALREADY_INITIALIZED"
                )
            )
        );

        GovernanceLib.StateStorage storage ss = GovernanceLib.getState();

        ss.isInit = true;
    }

    function isGovernanceInit() public view returns (bool) {
        GovernanceLib.StateStorage storage ss = GovernanceLib.getState();
        return ss.isInit;
    }

    function createElection(
        string memory _name,
        string memory _description,
        string memory _author,
        uint256 _electionEnd
    ) public governanceInitLock {
        GovernanceLib.StateStorage storage ss = GovernanceLib.getState();

        uint256 electionIndex = getElectionLength();
        ss.elections.push();

        GovernanceLib.Election storage election = ss.elections[electionIndex];
        election.name = _name;
        election.description = _description;
        election.author = _author;
        election.electionEnd = _electionEnd;
    }

    function endElection(uint256 electionIndex)
        public
        governanceInitLock
        returns (
            bool,
            uint256,
            uint256
        )
    {
        GovernanceLib.StateStorage storage ss = GovernanceLib.getState();

        require(
            block.timestamp > ss.elections[electionIndex].electionEnd,
            "Cannot end before allotted time."
        );
        require(
            !ss.elections[electionIndex].ended,
            "Election has already been ended."
        );

        ss.elections[electionIndex].ended = true;

        return isProposalSuccess(electionIndex);
    }

    function vote(uint256 electionIndex, bool approve)
        public
        virtual
        governanceInitLock
        returns (bool)
    {
        GovernanceLib.StateStorage storage ss = GovernanceLib.getState();

        require(
            block.timestamp < ss.elections[electionIndex].electionEnd,
            "Cannot vote after election has ended."
        );
        require(
            !ss.elections[electionIndex].voters[msg.sender].voted,
            "Cannot vote twice."
        );
        require(_isHolder(msg.sender), "Must be a holder to vote.");

        ss.elections[electionIndex].voters[msg.sender].voted = true;
        ss.elections[electionIndex].voters[msg.sender].approve = approve;

        ss.elections[electionIndex].votes[approve] = ss
            .elections[electionIndex]
            .votes[approve]
            .add(1);
        return true;
    }

    function getElectionLength()
        public
        view
        governanceInitLock
        returns (uint256)
    {
        GovernanceLib.StateStorage storage ss = GovernanceLib.getState();
        return ss.elections.length;
    }

    function getElectionMetaData(uint256 electionIndex)
        public
        view
        governanceInitLock
        returns (
            string memory,
            string memory,
            string memory,
            uint256,
            bool
        )
    {
        GovernanceLib.StateStorage storage ss = GovernanceLib.getState();

        return (
            ss.elections[electionIndex].name,
            ss.elections[electionIndex].description,
            ss.elections[electionIndex].author,
            ss.elections[electionIndex].electionEnd,
            ss.elections[electionIndex].ended
        );
    }

    function _isHolder(address sender) public view returns (bool) {
        return IERC20(address(this)).balanceOf(sender) > 0;
    }

    function getVoteCounts(uint256 electionIndex)
        public
        view
        virtual
        governanceInitLock
        returns (uint256, uint256)
    {
        GovernanceLib.StateStorage storage ss = GovernanceLib.getState();
        return (
            ss.elections[electionIndex].votes[true],
            ss.elections[electionIndex].votes[false]
        );
    }

    function getRemainingTime(uint256 electionIndex)
        public
        view
        virtual
        governanceInitLock
        returns (uint256)
    {
        GovernanceLib.StateStorage storage ss = GovernanceLib.getState();
        return ss.elections[electionIndex].electionEnd.sub(block.timestamp);
    }

    // proposals will only fail with 2/3 veto
    function isProposalSuccess(uint256 electionIndex)
        public
        view
        virtual
        governanceInitLock
        returns (
            bool,
            uint256,
            uint256
        )
    {
        GovernanceLib.StateStorage storage ss = GovernanceLib.getState();

        uint256 vetoCount = ss.elections[electionIndex].votes[false];

        if (vetoCount == 0) {
            return (
                true,
                ss.elections[electionIndex].votes[true],
                ss.elections[electionIndex].votes[false]
            );
        }

        return (
            ss
                .elections[electionIndex]
                .votes[true]
                .div(ss.elections[electionIndex].votes[false])
                .mul(100) > 33,
            ss.elections[electionIndex].votes[true],
            ss.elections[electionIndex].votes[false]
        );
    }
}
