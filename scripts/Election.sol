// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import { TuffToken } from  "./TuffToken.sol";

contract Election is Ownable {

    using SafeMath for uint256;

    struct Voter {
        bool voted;
        bool approve;
    }

    string public name;
    string public description;
    string public author;
    uint256 public electionEnd;
    mapping (address => Voter) public voters;
    mapping (bool => uint256) public candidates;
    bool public ended = false;
    TuffToken token;

    constructor (
        address initialOwner,
        string memory _name,
        string memory _description,
        string memory _author,
        uint256 _electionEnd,
        address payable _tokenAddr
    ) {
        transferOwnership(initialOwner);

        name = _name;
        description = _description;
        author = _author;
        electionEnd = _electionEnd;
        token = TuffToken(_tokenAddr);
    }


    function vote(bool approve) public virtual returns (bool) {
        require(block.timestamp < electionEnd, "Cannot vote after election has ended.");
        require(!voters[msg.sender].voted, "Cannot vote twice.");
        require(isHolder(msg.sender), "Must be a holder to vote.");

        voters[msg.sender].voted = true;
        voters[msg.sender].approve = approve;

        candidates[approve] = candidates[approve].add(1);
        return true;
    }

    function isHolder(address sender) public view returns (bool) {
        return token.balanceOf(sender) > 0;
    }

    function getVoteCounts() public view virtual returns (uint256, uint256) {
        return (candidates[true], candidates[false]);
    }

    function getRemainingTime() public view virtual returns (uint256) {
        return electionEnd.sub(block.timestamp);
    }

    // proposals will only fail with 2/3 veto
    function isProposalSuccess() public view virtual returns (bool, uint256, uint256) {

        uint256 vetoCount = candidates[false];

        if (vetoCount == 0) {
            return (true, candidates[true], candidates[false]);
        }

        return (candidates[true].div(candidates[false]).mul(100) > 33, candidates[true], candidates[false]);
    }

    function end() public virtual onlyOwner returns (bool, uint256, uint256) {
        require(block.timestamp > electionEnd, "Cannot end before allotted time.");
        require(!ended, "Election has already been ended.");

        ended = true;

        return isProposalSuccess();
    }

}
