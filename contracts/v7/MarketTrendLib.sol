// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.7.0;

library MarketTrendLib {

    //IMPORTANT: You must increment this string if you add a new variable to StateStorage that is not at the end
    string constant NAMESPACE = "io.BuffChain.TuffToken.MarketTrendLib.1";
    bytes32 constant POSITION = keccak256(bytes(NAMESPACE));

    //Make sure to update the `./test/utils` to add any additional PriceConsumer enums there as well
    enum PriceConsumer {CHAINLINK, UNISWAP}

    struct PriceData {
        uint256 price;
        uint256 timestamp;
    }

    struct StateStorage {
        bool isInit;

        PriceConsumer priceConsumer;
        PriceConsumer trackingPeriodPriceConsumer;
        PriceData[] priceDataEntries;

        uint buyBackChance;
        uint lastBuyBackChance;
        uint lastBuyBackChoice;
        bool isBuyBackNeeded;
        bool isNegativeOrZeroPriceChange;

        uint daysInEpoch;
        uint amountOfEpochsLowerLimit;
        uint amountOfEpochsUpperLimit;
        uint baseTrackingPeriodStart;
        uint baseTrackingPeriodEnd;
        uint buyBackChanceIncrement;
        uint buyBackChanceLowerLimit;
        uint buyBackChanceUpperLimit;

        uint trackingPeriodStart;
        uint trackingPeriodEnd;

        // Use an interval in seconds and a timestamp to slow execution of Upkeep between 85500 and 87300 seconds

        uint interval;
        uint lastTimeStamp;
        uint256 lastBuyBackTimestamp;
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
