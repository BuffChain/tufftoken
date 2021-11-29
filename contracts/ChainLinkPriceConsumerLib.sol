// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library ChainLinkPriceConsumerLib {

    //IMPORTANT: You must increment this string if you add a new variable to UniswapPoolDeployerStruct that is not at the end
    string constant NAMESPACE = "io.BuffChain.TuffToken.ChainLinkPriceConsumer.1";
    bytes32 constant POSITION = keccak256(bytes(NAMESPACE));

    struct StateStorage {
        bool isInit;
        AggregatorV3Interface priceFeed;
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
