// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./v7/IPriceConsumer.sol";


/*

can buy back when
1. it has been at least base market trend period is met since last buy back
2. price change from current day to 1 epoch's worth of days ago is negative
TODO work in probability that increases per epoch of buy back

Ex: buy back happens on day x, epoch = 7 days, base market trend period = 4 epochs
	- case 1: current day = x + 3 epochs and 6 days => no buy back;
	- case 2: current day = x + 4 epochs and 0 days, price change from current day - 7 days ago is + => no buy back;
	- case 3: current day = x + 4 epochs and 0 days, price change from current day - 7 days ago is - => buy back;
	- case 4: current day = x + 4 epochs and 1 days, price change from current day - 7 days ago is - => buy back;
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
        IPriceConsumer priceConsumer;
    }

    IPriceConsumer priceConsumer;
    TrackingPeriod[] trackingPeriods;
    PriceData[] priceDataEntries;
    uint daysInEpoch = 7;
    uint amountOfEpochsLowerLimit = 4;
    uint amountOfEpochsUpperLimit = 10;

    constructor(address initialOwner, address priceConsumerAddress, bool createInitialTrackingPeriod) {
        priceConsumer = IPriceConsumer(priceConsumerAddress);
        if (createInitialTrackingPeriod) {
            uint randomNumberOfEpochs = getPseudoRandomNumber(amountOfEpochsLowerLimit, amountOfEpochsUpperLimit);
            uint baseTrackingPeriodEnd = block.timestamp + (randomNumberOfEpochs * daysInEpoch * 1 days);
            createTrackingPeriod(block.timestamp, baseTrackingPeriodEnd);
        }
        transferOwnership(initialOwner);
    }

//    This will only take effect on next tracking period
    function setPriceConsumer(address priceConsumerAddress) public onlyOwner {
        priceConsumer = IPriceConsumer(priceConsumerAddress);
    }

    function getPriceConsumer() public onlyOwner view returns (address) {
        return address(priceConsumer);
    }

    function getPseudoRandomNumber(uint _rangeStart, uint _rangeEnd) private view returns (uint) {
        uint randomNumber = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % _rangeEnd;
        randomNumber = randomNumber + _rangeStart;
        return randomNumber;
    }

    function getCurrentTrackingPeriodIndex() public onlyOwner view returns (uint256) {
        return trackingPeriods.length - 1;
    }

    function createTrackingPeriod(uint baseTrackingPeriodStart, uint baseTrackingPeriodEnd) public onlyOwner {
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
        trackingPeriod.priceConsumer = priceConsumer;
        trackingPeriods.push(trackingPeriod);

    }

    function completeTrackingPeriod(uint256 trackingPeriodIndex, bool _isBuyBackNeeded) public onlyOwner {
        require(trackingPeriods[trackingPeriodIndex].isActive, "Cannot complete an inactive tracking period.");
        trackingPeriods[trackingPeriodIndex].isActive = false;
        trackingPeriods[trackingPeriodIndex].isBuyBackNeeded = _isBuyBackNeeded;
    }

    function pushPriceData(uint256 currentPrice) public onlyOwner {
        PriceData memory currentPriceData;
        currentPriceData.price = currentPrice;
        currentPriceData.timestamp = block.timestamp;
        priceDataEntries.push(currentPriceData);
    }

    function processCurrentMarketTrend() public onlyOwner {
        processMarketTrend(block.timestamp, getPrice());
    }

    function processMarketTrend(uint256 timestamp, uint256 currentPrice) public onlyOwner {

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

    function getPriceDataEntriesLength() public view onlyOwner returns (uint256) {
        return priceDataEntries.length;
    }

    function getStartingEntryIndex(uint256 lastEntryIndex) public view onlyOwner returns (uint256) {
        return lastEntryIndex - daysInEpoch;
    }

    function getPriceFromDataEntry(uint256 priceDataIndex) public view onlyOwner returns (uint256) {
        return priceDataEntries[priceDataIndex].price;
    }

    function getPrice() public view onlyOwner returns (uint256) {
        if (trackingPeriods.length > 0) {
            uint256 currentTrackingPeriodIndex = getCurrentTrackingPeriodIndex();
            TrackingPeriod memory trackingPeriod = trackingPeriods[currentTrackingPeriodIndex];
            return trackingPeriod.priceConsumer.getPrice();
        } else {
            return priceConsumer.getPrice();
        }
    }

    function isBuyBackNeeded(uint256 startPrice, uint256 endPrice) public pure returns (bool){
        return endPrice < startPrice;
    }

    function anyBuyBacksRequired() public view onlyOwner returns (bool) {
        bool required = false;
        for (uint256 trackingPeriod = 0; trackingPeriod < trackingPeriods.length; trackingPeriod++) {
            if (trackingPeriods[trackingPeriod].isBuyBackNeeded && !getIsBuyBackFulfilled(trackingPeriod)) {
                required = true;
                break;
            }
        }
        return required;
    }

    function getIsBuyBackFulfilled(uint256 trackingPeriod) public view onlyOwner returns (bool) {
        return trackingPeriods[trackingPeriod].isBuyBackFulfilled;
    }

    function setIsBuyBackFulfilled(uint256 trackingPeriod, bool fulfilled) public onlyOwner {
        trackingPeriods[trackingPeriod].isBuyBackFulfilled = fulfilled;
    }

}
