// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Election.sol";

contract Governance is Ownable {

    Election[] public elections;

    function createElection(string memory _name, uint256[] memory _proposedNewValues, address _targetAddress, string memory _targetFunction) public onlyOwner returns(address) {
        Election election = new Election(_name, _proposedNewValues, _targetAddress, _targetFunction);
        elections.push(election);
        return address(election);
    }

    function endElection(uint256 electionIndex) public onlyOwner {
        Election election = elections[electionIndex];

        require(block.timestamp > election.electionEnd());
        require(!election.ended());

        election.end();

        uint256 winningValue = election.getWinningValue();

        string memory targetFunction = election.targetFunction();
        address targetAddress = election.targetAddress();

        bytes memory payload = abi.encodeWithSignature(targetFunction, winningValue);
        (bool success, bytes memory returnData) = address(targetAddress).call(payload);
        require(success);

    }

}
