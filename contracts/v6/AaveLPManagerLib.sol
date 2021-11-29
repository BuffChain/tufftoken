// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.0;

library AaveLPManagerLib {
    //IMPORTANT: You must increment this string if you add a new variable to AaveLPManagerStruct that is not at the end
    bytes32 constant AaveLPManagerLib_Position = keccak256("io.BuffChain.TuffToken.AaveLPManagerLib.1");

    struct AaveLPManagerStruct {
        bool isInit;
        address[] supportedTokens;
        address lpProviderAddr;
        address lpAddr;
    }

    function aaveLPManagerStorage() internal pure returns (AaveLPManagerStruct storage aaveLPManagerStruct) {
        bytes32 position = AaveLPManagerLib_Position;

        //In solidity < 0.7, inline assembly slot and offset variables are referenced with an underscore. For instance,
        // variable `x` is referenced by `x_slot`
        assembly {
            aaveLPManagerStruct_slot := position
        }
    }
}
