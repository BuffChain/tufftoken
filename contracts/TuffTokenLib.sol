// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

library TuffTokenLib {
    //IMPORTANT: You must increment this string if you add a new variable to TuffTokenStruct that is not at the end
    bytes32 constant TuffTokenLib_Position = keccak256("io.buffchain.tufftoken.tufftoken.1");

    struct TuffTokenStruct {
        bool isInit;
        mapping (address => uint256) balances;
        mapping (address => mapping (address => uint256)) allowances;
        mapping (address => bool) isExcludedFromFee;

        string name;
        string symbol;
        uint8 decimals;
        uint256 farmFee;
        uint256 totalSupply;
    }

    function tuffTokenStorage() internal pure returns (TuffTokenStruct storage tuffTokenStruct) {
        bytes32 position = TuffTokenLib_Position;

        //In solidity > 0.7, inline assembly slot and offset variables are referenced with a period. For instance,
        // variable `x` is referenced by `x.slot`
        assembly {
            tuffTokenStruct.slot := position
        }
    }
}
