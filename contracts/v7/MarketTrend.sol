// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.7.0;
pragma abicoder v2;

import {MarketTrendLib} from "./MarketTrendLib.sol";

import {ChainLinkPriceConsumer} from "./ChainLinkPriceConsumer.sol";
import {UniswapPriceConsumer} from "./UniswapPriceConsumer.sol";

/*
can buy back when
1. it has been at least base market trend period is met since last buy back
2. price change from current day to 1 epoch's worth of days ago is negative
3. random number choice is below current chance percent

Ex: buy back happens on day x, epoch = 7 days, base market trend period = 4 epochs
	- case 1: current day = x + 3 epochs and 6 days => no buy back;
	- case 2: current day = x + 4 epochs and 0 days, price change from current day - 7 days ago is + => no buy back;
	- case 3: current day = x + 4 epochs and 0 days, price change from current day - 7 days ago is -, chance = 10%, choice = 19 => no buy back;
	- case 4: current day = x + 4 epochs and 1 days, price change from current day - 7 days ago is -, chance = 20%, choice = 19  => buy back;
*/
contract MarketTrend {
    modifier initMarketTrendLock() {
        require(isMarketTrendInit(), string(abi.encodePacked(MarketTrendLib.NAMESPACE, ": ", "UNINITIALIZED")));
        _;
    }

    function isMarketTrendInit() public view returns (bool) {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return ss.isInit;
    }

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initMarketTrend(MarketTrendLib.PriceConsumer priceConsumer, bool createInitialTrackingPeriod) public {
        require(!isMarketTrendInit(), string(abi.encodePacked(MarketTrendLib.NAMESPACE, ": ", "ALREADY_INITIALIZED")));

        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        ss.daysInEpoch = 7;
        ss.amountOfEpochsLowerLimit = 4;
        ss.amountOfEpochsUpperLimit = 10;
        ss.buyBackChanceIncrement = 10;
        ss.buyBackChanceLowerLimit = 1;
        ss.buyBackChanceUpperLimit = 100;

        ss.priceConsumer = priceConsumer;

        if (createInitialTrackingPeriod) {
            uint randomNumberOfEpochs = getPseudoRandomNumber(ss.amountOfEpochsLowerLimit, ss.amountOfEpochsUpperLimit);
            uint baseTrackingPeriodEnd = block.timestamp + (randomNumberOfEpochs * ss.daysInEpoch * 1 days);
            createTrackingPeriod(block.timestamp, baseTrackingPeriodEnd);
        }

        ss.isInit = true;
    }

    //This will only take effect on next tracking period
    function setPriceConsumer(MarketTrendLib.PriceConsumer priceConsumer) public initMarketTrendLock {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        ss.priceConsumer = priceConsumer;
    }

    function getPriceConsumer() public initMarketTrendLock view returns (MarketTrendLib.PriceConsumer) {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return ss.priceConsumer;
    }

    function setDaysInEpoch(uint _daysInEpoch) public initMarketTrendLock {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        ss.daysInEpoch = _daysInEpoch;
    }

    function getDaysInEpoch() public initMarketTrendLock view returns (uint) {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return ss.daysInEpoch;
    }

    function setAmountOfEpochsLowerLimit(uint amountOfEpochsLowerLimit) public initMarketTrendLock {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        ss.amountOfEpochsLowerLimit = amountOfEpochsLowerLimit;
    }

    function getAmountOfEpochsLowerLimit() public initMarketTrendLock view returns (uint) {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return ss.amountOfEpochsLowerLimit;
    }

    function setAmountOfEpochsUpperLimit(uint _amountOfEpochsUpperLimit) public initMarketTrendLock {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        ss.amountOfEpochsUpperLimit = _amountOfEpochsUpperLimit;
    }

    function setAmountOfEpochsUpperLimit() public initMarketTrendLock view returns (uint) {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return ss.amountOfEpochsUpperLimit;
    }

    function getPseudoRandomNumber(uint _rangeStart, uint _rangeEnd) public initMarketTrendLock view returns (uint) {
        uint randomNumber = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % _rangeEnd;
        randomNumber = randomNumber + _rangeStart;
        return randomNumber;
    }

    function getCurrentTrackingPeriodIndex() public initMarketTrendLock view returns (uint256) {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return ss.trackingPeriods.length - 1;
    }

    function createTrackingPeriod(uint baseTrackingPeriodStart, uint baseTrackingPeriodEnd) public initMarketTrendLock {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();

        require(
            ss.trackingPeriods.length == 0 ||
            !ss.trackingPeriods[ss.trackingPeriods.length - 1].isActive,
            "Can only have one active tracking period."
        );

        MarketTrendLib.PriceData memory priceData;
        priceData.price = getPrice();
        priceData.timestamp = baseTrackingPeriodStart;
        ss.priceDataEntries.push(priceData);

        MarketTrendLib.TrackingPeriod memory trackingPeriod;
        trackingPeriod.baseTrackingPeriodStart = baseTrackingPeriodStart;
        trackingPeriod.baseTrackingPeriodEnd = baseTrackingPeriodEnd;
        trackingPeriod.isActive = true;
        trackingPeriod.priceConsumer = ss.priceConsumer;
        trackingPeriod.buyBackChance = ss.buyBackChanceIncrement;
        ss.trackingPeriods.push(trackingPeriod);
    }

    function completeTrackingPeriod(uint256 trackingPeriodIndex) public initMarketTrendLock {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();

        require(ss.trackingPeriods[trackingPeriodIndex].isActive, "Cannot complete an inactive tracking period.");
        ss.trackingPeriods[trackingPeriodIndex].isActive = false;
        ss.trackingPeriods[trackingPeriodIndex].isBuyBackNeeded = true;
    }

    function pushPriceData(uint256 currentPrice) public initMarketTrendLock {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();

        MarketTrendLib.PriceData memory currentPriceData;
        currentPriceData.price = currentPrice;
        currentPriceData.timestamp = block.timestamp;
        ss.priceDataEntries.push(currentPriceData);
    }

    function processCurrentMarketTrend() public initMarketTrendLock {
        processMarketTrend(block.timestamp, getPrice());
    }

    function processMarketTrend(uint256 timestamp, uint256 currentPrice) public initMarketTrendLock {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();

        uint256 currentTrackingPeriodIndex = getCurrentTrackingPeriodIndex();
        //TODO: Why storage, when below you use memory?
        MarketTrendLib.TrackingPeriod storage trackingPeriod = ss.trackingPeriods[currentTrackingPeriodIndex];

        pushPriceData(currentPrice);

        uint256 lastEntryIndex = getPriceDataEntriesLength() - 1;
        uint256 startingEntryIndex = getStartingEntryIndex(lastEntryIndex);

        if (timestamp < trackingPeriod.baseTrackingPeriodEnd || startingEntryIndex < 0) {
            //TODO: comment: tracking period hasn't completed yet or it hasn't started yet
            return;
        }

        uint256 startingPrice = getPriceFromDataEntry(startingEntryIndex);
        if (!isNegativeOrZeroPriceChange(startingPrice, currentPrice)) {
            //TODO: comment: Not a bull trend, no need to continue processing the market trend
            return;
        }

        uint buyBackRandomNumber = getPseudoRandomNumber(ss.buyBackChanceLowerLimit, ss.buyBackChanceUpperLimit);
        trackingPeriod.lastBuyBackChance = trackingPeriod.buyBackChance;
        trackingPeriod.lastBuyBackChoice = buyBackRandomNumber;

        if (buyBackRandomNumber < trackingPeriod.buyBackChance) {
            completeTrackingPeriod(currentTrackingPeriodIndex);
            uint randomNumberOfEpochs = getPseudoRandomNumber(ss.amountOfEpochsLowerLimit, ss.amountOfEpochsUpperLimit);
            uint baseTrackingPeriodEnd = block.timestamp + (randomNumberOfEpochs * ss.daysInEpoch * 1 days);
            createTrackingPeriod(block.timestamp, baseTrackingPeriodEnd);
        } else {
            trackingPeriod.buyBackChance = trackingPeriod.buyBackChance + ss.buyBackChanceIncrement;
        }
    }

    function isNegativeOrZeroPriceChange(uint256 oldPrice, uint256 newPrice) public pure returns (bool){
        return oldPrice >= newPrice;
    }

    function getPriceDataEntriesLength() public view initMarketTrendLock returns (uint256) {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return ss.priceDataEntries.length;
    }

    function getStartingEntryIndex(uint256 lastEntryIndex) public view initMarketTrendLock returns (uint256) {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return lastEntryIndex - ss.daysInEpoch;
    }

    function getPriceFromDataEntry(uint256 priceDataIndex) public view initMarketTrendLock returns (uint256) {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return ss.priceDataEntries[priceDataIndex].price;
    }

    function getPrice() public view initMarketTrendLock returns (uint256) {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();

        if (ss.trackingPeriods.length > 0) {
            uint256 currentTrackingPeriodIndex = getCurrentTrackingPeriodIndex();

            //TODO: Why memory, when above you used storage?
            MarketTrendLib.TrackingPeriod memory trackingPeriod = ss.trackingPeriods[currentTrackingPeriodIndex];
            return getPriceFromPriceConsumer(trackingPeriod.priceConsumer);
        } else {
            return getPriceFromPriceConsumer(ss.priceConsumer);
        }
    }

    function getPriceFromPriceConsumer(MarketTrendLib.PriceConsumer priceConsumer) public view initMarketTrendLock returns (uint256) {
        if (priceConsumer == MarketTrendLib.PriceConsumer.CHAINLINK) {
            return ChainLinkPriceConsumer(address(this)).getChainLinkPrice();
        } else if (priceConsumer == MarketTrendLib.PriceConsumer.UNISWAP) {
            return UniswapPriceConsumer(address(this)).getUniswapPrice();
        } else {
            revert("A valid price consumer class was not provided");
        }
    }

    function anyBuyBacksRequired() public view initMarketTrendLock returns (bool) {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();

        bool required = false;
        for (uint256 trackingPeriodIndex = 0; trackingPeriodIndex < ss.trackingPeriods.length; trackingPeriodIndex++) {
            MarketTrendLib.TrackingPeriod memory trackingPeriod = ss.trackingPeriods[trackingPeriodIndex];
            if (trackingPeriod.isBuyBackNeeded && !trackingPeriod.isBuyBackFulfilled) {
                required = true;
                break;
            }
        }
        return required;
    }

    function getIsBuyBackFulfilled(uint256 trackingPeriod) public view initMarketTrendLock returns (bool) {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return ss.trackingPeriods[trackingPeriod].isBuyBackFulfilled;
    }

    function setIsBuyBackFulfilled(uint256 trackingPeriod, bool fulfilled) public initMarketTrendLock {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        ss.trackingPeriods[trackingPeriod].isBuyBackFulfilled = fulfilled;
    }

    function getLastBuyBackChoiceResults(uint256 trackingPeriodIndex) public view initMarketTrendLock returns (uint, uint) {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        MarketTrendLib.TrackingPeriod memory trackingPeriod = ss.trackingPeriods[trackingPeriodIndex];
        return (trackingPeriod.lastBuyBackChance, trackingPeriod.lastBuyBackChoice);
    }
}