// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Election is Ownable {

    struct Voter {
        bool voted;
        uint256 voteIndex;
    }

    struct Candidate {
        uint256 newValue;
        uint256 voteCount;
    }

    string public name;
    address public targetAddress;
    string public targetFunction;
    uint256 public electionEnd;
    mapping (address => Voter) public voters;
    Candidate[] public candidates;
    bool public ended = false;

    constructor (string memory _name, uint256[] memory _proposedNewValues, address _targetAddress, string memory _targetFunction) public {
        name = _name;
        targetFunction = _targetFunction;
        targetAddress = _targetAddress;
        electionEnd = block.timestamp + 60 seconds;
        for (uint256 proposalIndex = 0; proposalIndex < _proposedNewValues.length; proposalIndex++) {
            candidates.push(Candidate(_proposedNewValues[proposalIndex], 0));
        }

    }

    function vote(uint256 voteIndex) public {
        require(block.timestamp < electionEnd);
        require(!voters[msg.sender].voted);

        voters[msg.sender].voted = true;
        voters[msg.sender].voteIndex = voteIndex;
        candidates[voteIndex].voteCount += 1;
    }

    function getWinningValue() public view returns (uint256) {
        uint256 maxVotes;
        uint256 _winnerIndex;
        for (uint256 candidateIndex = 0; candidateIndex < candidates.length; candidateIndex++) {
            if (candidates[candidateIndex].voteCount > maxVotes) {
                maxVotes = candidates[candidateIndex].voteCount;
                _winnerIndex = candidateIndex;
            }
        }
        return candidates[_winnerIndex].newValue;
    }

    function end() public onlyOwner {
        ended = true;
    }

}
