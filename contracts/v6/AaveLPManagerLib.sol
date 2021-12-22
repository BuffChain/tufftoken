// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.0;

library AaveLPManagerLib {

    //IMPORTANT: You must increment this string if you add a new variable to StateStorage that is not at the end
    string constant NAMESPACE = "io.BuffChain.TuffToken.AaveLPManagerLib.1";
    bytes32 constant POSITION = keccak256(bytes(NAMESPACE));

    struct StateStorage {
        bool isInit;
        mapping (address => bool) supportedTokens;
        uint supportedTokensCount;
        address lpProviderAddr;
        address lpAddr;
    }

    function getState() internal pure returns (StateStorage storage stateStorage) {
        bytes32 position = POSITION;

        //In solidity < 0.7, inline assembly slot and offset variables are referenced with an underscore. For instance,
        // variable `x` is referenced by `x_slot`
        assembly {
            stateStorage_slot := position
        }
    }
}
