// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.7.0;

library MarketTrendLib {

    //IMPORTANT: You must increment this string if you add a new variable to UniswapPoolDeployerStruct that is not at the end
    string constant NAMESPACE = "io.BuffChain.TuffToken.MarketTrendLib.1";
    bytes32 constant POSITION = keccak256(bytes(NAMESPACE));

    //Make sure to update the `./test/utils` to add any additional PriceConsumer enums there as well
    enum PriceConsumer {CHAINLINK, UNISWAP}

    struct PriceData {
        uint256 price;
        uint256 timestamp;
    }

    struct TrackingPeriod {
        uint baseTrackingPeriodStart;
        uint baseTrackingPeriodEnd;
        bool isActive;
        bool isBuyBackNeeded;
        bool isBuyBackFulfilled;
        uint buyBackChance;
        uint lastBuyBackChance;
        uint lastBuyBackChoice;
        PriceConsumer priceConsumer;
    }

    struct StateStorage {
        bool isInit;
        PriceConsumer priceConsumer;
        TrackingPeriod[] trackingPeriods;
        PriceData[] priceDataEntries;
        uint daysInEpoch;
        uint amountOfEpochsLowerLimit;
        uint amountOfEpochsUpperLimit;
        uint buyBackChanceIncrement;
        uint buyBackChanceLowerLimit;
        uint buyBackChanceUpperLimit;
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
