// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.0;

/// @notice storage lib for the AaveLPManager contract.
library AaveLPManagerLib {
    //IMPORTANT: You must increment this string if you add a new variable to StateStorage that is not at the end
    string public constant NAMESPACE = "io.BuffChain.TuffToken.AaveLPManagerLib.1";
    bytes32 public constant POSITION = keccak256(bytes(NAMESPACE));

    struct StateStorage {
        bool isInit;
        address[] supportedTokens;
        mapping(address => TokenMetadata) tokenMetadata;
        address lpProviderAddr;
        address protocolDataProviderAddr;
        address wethAddr;
        uint24 balanceBufferPercent;
        uint256 totalTargetWeight;
        uint24 decimalPrecision;
    }

    struct TokenMetadata {
        address chainlinkEthTokenAggrAddr;
        uint256 targetWeight;
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
