// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

library TokenMaturityLib {
    //IMPORTANT: You must increment this string if you add a new variable to StateStorage that is not at the end
    string public constant NAMESPACE = "io.BuffChain.TuffToken.TokenMaturityLib.1";
    bytes32 public constant POSITION = keccak256(bytes(NAMESPACE));

    struct StateStorage {
        bool isInit;
        mapping(address => bool) ownersRedeemed;
        mapping(address => uint256) ownersRedemptionBalances;
        uint256 contractMaturityTimestamp;
        bool isTreasuryLiquidated;
        //        Should be set to TUFF total supply when token reaches maturity. Intentionally separate state variable so
        //        that tokens burned during redemption do not impact other redemption amounts.
        //        redemption amount = contract eth balance * holder TUFF balance / total supply for redemption
        uint256 totalSupplyForRedemption;
        uint256 startingEthBalance;
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
