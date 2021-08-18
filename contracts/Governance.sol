// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Election.sol";

contract Governance is Ownable {

    mapping(address => Election) public elections;
    address payable tokenAddr;

    constructor(address payable _tokenAddr) {
        tokenAddr = _tokenAddr;
    }

    function createElection(
        string memory _name,
        string memory _description,
        string memory _author,
        uint256 _electionEnd
    )
    public onlyOwner returns(address) {
        Election election = new Election(_name, _description, _author, _electionEnd, tokenAddr);
        elections[address(election)] = election;
        return address(election);
    }

    function endElection(address electionAddress) public onlyOwner returns (bool, uint256, uint256) {
        return elections[electionAddress].end();
    }

}

