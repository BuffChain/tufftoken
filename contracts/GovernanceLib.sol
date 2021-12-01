// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

library GovernanceLib {
    //IMPORTANT: You must increment this string if you add a new variable to TuffTokenStruct that is not at the end
    string constant NAMESPACE = "io.BuffChain.TuffToken.GovernanceLib.1";
    bytes32 constant POSITION = keccak256(bytes(NAMESPACE));

    struct Voter {
        bool voted;
        bool approve;
    }

    struct Election {
        string name;
        string description;
        string author;
        uint256 electionEnd;
        bool ended;
        mapping (address => Voter) voters;
        mapping (bool => uint256) votes;
    }

    struct StateStorage {
        bool isInit;
        Election[] elections;
    }

    function getState() internal pure returns (StateStorage storage stateStorage) {
        bytes32 position = POSITION;

        //In solidity > 0.7, inline assembly slot and offset variables are referenced with a period. For instance,
        // variable `x` is referenced by `x.slot`
        assembly {
            stateStorage.slot := position
        }
    }
}
