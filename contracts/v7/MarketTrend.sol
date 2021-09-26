// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.5.0 <0.8.0;

import "@openzeppelin/contracts-v6/access/Ownable.sol";
import {UniswapV3PoolManager} from "./UniswapV3PoolManager.sol";


/*
epoch = 7 days
base market trend period = range of 3 to 10 epochs
can buy back when it has been at least base market trend period is met since last buy back and the next epoch trend is bear

Ex: base market trend period = 3 epochs, buy back happens on day x
	- case 4 epochs passed since day x and 4th epoch was bull: buy back = false;
	- case 5 epochs passed since day x and 5th epoch was bear: buy back = true;
*/


contract MarketTrend is Ownable {

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
    }

    UniswapV3PoolManager poolManager;
    TrackingPeriod[] trackingPeriods;
    PriceData[] priceDataEntries;
    uint daysInEpoch = 7;
    uint amountOfEpochsLowerLimit = 4;
    uint amountOfEpochsUpperLimit = 10;

    constructor(address _poolManagerAddress, bool createInitialTrackingPeriod) {
        poolManager = UniswapV3PoolManager(_poolManagerAddress);
        if (createInitialTrackingPeriod) {
            createTrackingPeriod(block.timestamp, getPrice());
        }
    }

    function getPseudoRandomNumber(uint _rangeStart, uint _rangeEnd) private view returns (uint) {
        uint randomNumber = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % _rangeEnd;
        randomNumber = randomNumber + _rangeStart;
        return randomNumber;
    }

    function getCurrentTrackingPeriodIndex() public view returns (uint256) {
        return trackingPeriods.length - 1;
    }

    function createTrackingPeriod(uint baseTrackingPeriodStart, uint baseTrackingPeriodEnd) public {
        require(
            trackingPeriods.length == 0 ||
            !trackingPeriods[trackingPeriods.length - 1].isActive,
            "Can only have one active tracking period."
        );

        PriceData memory priceData;
        priceData.price = getPrice();
        priceData.timestamp = baseTrackingPeriodStart;
        priceDataEntries.push(priceData);

        TrackingPeriod memory trackingPeriod;
        trackingPeriod.baseTrackingPeriodStart = baseTrackingPeriodStart;
        trackingPeriod.baseTrackingPeriodEnd = baseTrackingPeriodEnd;
        trackingPeriod.isActive = true;
        trackingPeriods.push(trackingPeriod);

    }

    function completeTrackingPeriod(uint256 trackingPeriodIndex, bool _isBuyBackNeeded) public  {
        require(trackingPeriods[trackingPeriodIndex].isActive, "Cannot complete an inactive tracking period.");
        trackingPeriods[trackingPeriodIndex].isActive = false;
        trackingPeriods[trackingPeriodIndex].isBuyBackNeeded = _isBuyBackNeeded;
    }

    function pushPriceData(uint256 currentPrice) public {
        PriceData memory currentPriceData;
        currentPriceData.price = currentPrice;
        currentPriceData.timestamp = block.timestamp;
        priceDataEntries.push(currentPriceData);
    }

    function processCurrentMarketTrend() public {
        processMarketTrend(block.timestamp, getPrice());
    }

    function processMarketTrend(uint256 timestamp, uint256 currentPrice) public {

        uint256 currentTrackingPeriodIndex = getCurrentTrackingPeriodIndex();
        TrackingPeriod memory trackingPeriod = trackingPeriods[currentTrackingPeriodIndex];

        pushPriceData(currentPrice);

        uint256 lastEntryIndex = getPriceDataEntriesLength() - 1;
        uint256 startingEntryIndex = getStartingEntryIndex(lastEntryIndex);

        if (timestamp >= trackingPeriod.baseTrackingPeriodEnd && startingEntryIndex >= 0) {

            uint256 startingPrice = getPriceFromDataEntry(startingEntryIndex);

            bool _isBuyBackNeeded = isBuyBackNeeded(startingPrice, currentPrice);

            if (_isBuyBackNeeded) {
                completeTrackingPeriod(currentTrackingPeriodIndex, _isBuyBackNeeded);
                uint randomNumberOfEpochs = getPseudoRandomNumber(amountOfEpochsLowerLimit, amountOfEpochsUpperLimit);
                uint baseTrackingPeriodEnd = block.timestamp + (randomNumberOfEpochs * daysInEpoch * 1 days);
                createTrackingPeriod(block.timestamp, baseTrackingPeriodEnd);
            }

        }

    }

    function getPriceDataEntriesLength() public view returns (uint256) {
        return priceDataEntries.length;
    }

    function getStartingEntryIndex(uint256 lastEntryIndex) public view returns (uint256) {
        return lastEntryIndex - daysInEpoch;
    }

    function getPriceFromDataEntry(uint256 priceDataIndex) public view returns (uint256) {
        return priceDataEntries[priceDataIndex].price;
    }

    function getPrice() public view returns (uint256) {
        uint32 period = 3600;
        return poolManager.getQuote(period);
    }

    function isBuyBackNeeded(uint256 startPrice, uint256 endPrice) public view returns (bool){
        return endPrice < startPrice;
    }

    function anyBuyBacksRequired() public view returns (bool) {
        bool required = false;
        for (uint256 trackingPeriod = 0; trackingPeriod < trackingPeriods.length; trackingPeriod++) {
            if (trackingPeriods[trackingPeriod].isBuyBackNeeded && !getIsBuyBackFulfilled(trackingPeriod)) {
                required = true;
                break;
            }
        }
        return required;
    }

    function getIsBuyBackFulfilled(uint256 trackingPeriod) public view returns (bool) {
        return trackingPeriods[trackingPeriod].isBuyBackFulfilled;
    }

    function setIsBuyBackFulfilled(uint256 trackingPeriod, bool fulfilled) public {
        trackingPeriods[trackingPeriod].isBuyBackFulfilled = fulfilled;
    }

}
