// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import { TuffToken } from  "./TuffToken.sol";

contract Governance is Ownable {

    using SafeMath for uint256;

    struct Voter {
        bool voted;
        bool approve;
    }

    struct Election {
        string  name;
        string  description;
        string  author;
        uint256  electionEnd;
        bool ended;
        mapping (address => Voter) voters;
        mapping (bool => uint256) votes;
    }

    Election[] public elections;
    TuffToken token;

    constructor(address initialOwner, address payable _tokenAddr) {
        transferOwnership(initialOwner);
        token = TuffToken(_tokenAddr);
    }

    function createElection(
        string memory _name,
        string memory _description,
        string memory _author,
        uint256 _electionEnd
    ) public onlyOwner {

        uint256 electionIndex = getElectionLength();
        elections.push();

        Election storage election = elections[electionIndex];
        election.name = _name;
        election.description = _description;
        election.author = _author;
        election.electionEnd = _electionEnd;

    }

    function endElection(uint256 electionIndex) public onlyOwner returns (bool, uint256, uint256) {

        require(block.timestamp > elections[electionIndex].electionEnd, "Cannot end before allotted time.");
        require(!elections[electionIndex].ended, "Election has already been ended.");

        elections[electionIndex].ended = true;

        return isProposalSuccess(electionIndex);
    }

    function vote(uint256 electionIndex, bool approve) public virtual returns (bool) {

        require(block.timestamp < elections[electionIndex].electionEnd, "Cannot vote after election has ended.");
        require(!elections[electionIndex].voters[msg.sender].voted, "Cannot vote twice.");
        require(isHolder(msg.sender), "Must be a holder to vote.");

        elections[electionIndex].voters[msg.sender].voted = true;
        elections[electionIndex].voters[msg.sender].approve = approve;

        elections[electionIndex].votes[approve] = elections[electionIndex].votes[approve].add(1);
        return true;
    }

    function getElectionLength() public view returns (uint256) {
        return elections.length;
    }

    function getElectionMetaData(uint256 electionIndex) public view returns (
        string memory,
        string memory,
        string memory,
        uint256,
        bool
    ) {
        return (
        elections[electionIndex].name,
        elections[electionIndex].description,
        elections[electionIndex].author,
        elections[electionIndex].electionEnd,
        elections[electionIndex].ended
        );
    }

    function isHolder(address sender) public view returns (bool) {
        return token.balanceOf(sender) > 0;
    }

    function getVoteCounts(uint256 electionIndex) public view virtual returns (uint256, uint256) {
        return (elections[electionIndex].votes[true], elections[electionIndex].votes[false]);
    }

    function getRemainingTime(uint256 electionIndex) public view virtual returns (uint256) {
        return elections[electionIndex].electionEnd.sub(block.timestamp);
    }

    // proposals will only fail with 2/3 veto
    function isProposalSuccess(uint256 electionIndex) public view virtual returns (bool, uint256, uint256) {

        uint256 vetoCount = elections[electionIndex].votes[false];

        if (vetoCount == 0) {
            return (true, elections[electionIndex].votes[true], elections[electionIndex].votes[false]);
        }

        return (
        elections[electionIndex].votes[true].div(elections[electionIndex].votes[false]).mul(100) > 33,
        elections[electionIndex].votes[true],
        elections[electionIndex].votes[false]
        );
    }


}
