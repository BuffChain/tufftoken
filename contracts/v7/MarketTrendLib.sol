// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.7.0;

library MarketTrendLib {
    //IMPORTANT: You must increment this string if you add a new variable to StateStorage that is not at the end
    string constant NAMESPACE = "io.BuffChain.TuffToken.MarketTrendLib.1";
    bytes32 constant POSITION = keccak256(bytes(NAMESPACE));

    //Make sure to update the `./test/utils` to add any additional PriceConsumer enums there as well
    enum PriceConsumer {
        CHAINLINK,
        UNISWAP
    }

    struct PriceData {
        uint256 price;
        uint256 timestamp;
    }

    struct BuyBackPool {
        uint256 lastBalance;
        uint256 accruedInterest;
    }

    struct StateStorage {
        bool isInit;
        PriceConsumer priceConsumer;
        PriceConsumer trackingPeriodPriceConsumer;
        PriceData[] priceDataEntries;
        uint256 buyBackChance;
        uint256 lastBuyBackChance;
        uint256 lastBuyBackChoice;
        bool isBuyBackNeeded;
        bool isNegativeOrZeroPriceChange;
        uint256 daysInEpoch;
        uint256 amountOfEpochsLowerLimit;
        uint256 amountOfEpochsUpperLimit;
        uint256 baseTrackingPeriodStart;
        uint256 baseTrackingPeriodEnd;
        uint256 buyBackChanceIncrement;
        uint256 buyBackChanceLowerLimit;
        uint256 buyBackChanceUpperLimit;
        uint256 trackingPeriodStart;
        uint256 trackingPeriodEnd;
        // Use an interval in seconds and a timestamp to slow execution of Upkeep between 85500 and 87300 seconds

        uint256 interval;
        uint256 lastTimeStamp;
        uint256 lastBuyBackTimestamp;
        mapping(address => BuyBackPool) buyBackPools;
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
