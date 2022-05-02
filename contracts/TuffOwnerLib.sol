// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

library TuffOwnerLib {
    //IMPORTANT: You must increment this string if you add a new variable to StateStorage that is not at the end
    string constant NAMESPACE = "io.BuffChain.TuffToken.TuffOwnerLib.1";
    bytes32 constant POSITION = keccak256(bytes(NAMESPACE));

    struct StateStorage {
        bool isInit;
        address _owner;
    }

    function getState()
        internal
        pure
        returns (StateStorage storage stateStorage)
    {
        bytes32 position = POSITION;

        //In solidity > 0.7, inline assembly slot and offset variables are referenced with a period. For instance,
        // variable `x` is referenced by `x.slot`
        assembly {
            stateStorage.slot := position
        }
    }
}
