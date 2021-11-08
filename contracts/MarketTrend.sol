// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "./v7/IPriceConsumer.sol";

import { FarmTreasury } from  "./FarmTreasury.sol";
import "./MarketTrendKeeperHelper.sol";


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


contract MarketTrend is Ownable, KeeperCompatibleInterface {

    struct PriceData {
        uint256 price;
        uint256 timestamp;
    }

    uint trackingPeriodStart;
    uint baseTrackingPeriodEnd;
    uint buyBackChance;
    uint lastBuyBackChance;
    uint lastBuyBackChoice;
    IPriceConsumer trackingPeriodPriceConsumer;
    bool isBuyBackNeeded;
    bool _isNegativeOrZeroPriceChange;

    IPriceConsumer priceConsumer;
    FarmTreasury farmTreasury;
    PriceData[] priceDataEntries;

    uint daysInEpoch = 7;
    uint amountOfEpochsLowerLimit = 4;
    uint amountOfEpochsUpperLimit = 10;

    uint buyBackChanceIncrement = 10;
    uint buyBackChanceLowerLimit = 1;
    uint buyBackChanceUpperLimit = 100;

    uint256 lastBuyBackTimestamp;

    MarketTrendKeeperHelper marketTrendKeeperHelper;

    /**
    * Use an interval in seconds and a timestamp to slow execution of Upkeep between 85500 and 87300 seconds
    */
    uint public interval;
    uint public lastTimeStamp;

    constructor(address initialOwner, address priceConsumerAddress, bool createInitialTrackingPeriod, address payable farmTreasuryAddress, address marketTrendKeeperHelperAddress) {
        priceConsumer = IPriceConsumer(priceConsumerAddress);
        farmTreasury = FarmTreasury(farmTreasuryAddress);
        marketTrendKeeperHelper = MarketTrendKeeperHelper(marketTrendKeeperHelperAddress);
        if (createInitialTrackingPeriod) {
            uint randomNumberOfEpochs = getPseudoRandomNumber(amountOfEpochsLowerLimit, amountOfEpochsUpperLimit);
            uint baseTrackingPeriodEnd = block.timestamp + (randomNumberOfEpochs * daysInEpoch * 1 days);
            createTrackingPeriod(block.timestamp, baseTrackingPeriodEnd);
        }

        interval = 86400; // starts at 1 day
        lastTimeStamp = block.timestamp;

        transferOwnership(initialOwner);
    }

//    This will only take effect on next tracking period
    function setPriceConsumer(address priceConsumerAddress) public onlyOwner {
        priceConsumer = IPriceConsumer(priceConsumerAddress);
    }

    function getPriceConsumer() public onlyOwner view returns (address) {
        return address(priceConsumer);
    }

    function setMarketTrendKeeperHelper(address marketTrendKeeperHelperAddress) public onlyOwner {
        marketTrendKeeperHelper = MarketTrendKeeperHelper(marketTrendKeeperHelperAddress);
    }

    function getMarketTrendKeeperHelper() public onlyOwner view returns (address) {
        return address(marketTrendKeeperHelper);
    }

    function setInterval(uint _interval) public onlyOwner {
        interval = _interval;
    }

    function getInterval() public view returns (uint) {
        return interval;
    }

    function setLastTimestamp(uint _lastTimeStamp) public onlyOwner {
        lastTimeStamp = _lastTimeStamp;
    }

    function getLastTimestamp() public view returns (uint) {
        return lastTimeStamp;
    }

    function setDaysInEpoch(uint _daysInEpoch) public onlyOwner {
        daysInEpoch = _daysInEpoch;
    }

    function getDaysInEpoch() public onlyOwner view returns (uint) {
        return daysInEpoch;
    }

    function setAmountOfEpochsLowerLimit(uint _amountOfEpochsLowerLimit) public onlyOwner {
        amountOfEpochsLowerLimit = _amountOfEpochsLowerLimit;
    }

    function getAmountOfEpochsLowerLimit() public onlyOwner view returns (uint) {
        return amountOfEpochsLowerLimit;
    }

    function setAmountOfEpochsUpperLimit(uint _amountOfEpochsUpperLimit) public onlyOwner {
        amountOfEpochsUpperLimit = _amountOfEpochsUpperLimit;
    }

    function setAmountOfEpochsUpperLimit() public onlyOwner view returns (uint) {
        return amountOfEpochsUpperLimit;
    }

    function getTrackingPeriodStart() public view returns (uint256) {
        return trackingPeriodStart;
    }

    function getLastBuyBackTimestamp() public view returns (uint256) {
        return lastBuyBackTimestamp;
    }

    function getIsBuyBackNeeded() public view returns (bool) {
        return isBuyBackNeeded;
    }

    function getIsNegativeOrZeroPriceChange() public view returns (bool) {
        return _isNegativeOrZeroPriceChange;
    }

    function getPseudoRandomNumber(uint _rangeStart, uint _rangeEnd) public view returns (uint) {
        uint randomNumber = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % _rangeEnd;
        randomNumber = randomNumber + _rangeStart;
        return randomNumber;
    }

    function createTrackingPeriod(uint _trackingPeriodStart, uint baseTrackingPeriodEnd) public onlyOwner {

        delete priceDataEntries;

        PriceData memory priceData;
        priceData.price = getPrice();
        priceData.timestamp = _trackingPeriodStart;
        priceDataEntries.push(priceData);

        trackingPeriodStart = _trackingPeriodStart;
        baseTrackingPeriodEnd = baseTrackingPeriodEnd;
        trackingPeriodPriceConsumer = priceConsumer;
        buyBackChance = buyBackChanceIncrement;

    }

    function pushPriceData(uint256 currentPrice) public onlyOwner {
        PriceData memory currentPriceData;
        currentPriceData.price = currentPrice;
        currentPriceData.timestamp = block.timestamp;
        priceDataEntries.push(currentPriceData);
    }

    function processCurrentMarketTrend() public onlyOwner {
        processMarketTrend(getPrice());
    }

    function processMarketTrend(uint256 currentPrice) public onlyOwner {

        pushPriceData(currentPrice);

        uint256 lastEntryIndex = getPriceDataEntriesLength() - 1;
        uint256 startingEntryIndex = getStartingEntryIndex(lastEntryIndex);

        uint256 startingPrice = getPriceFromDataEntry(startingEntryIndex);

        _isNegativeOrZeroPriceChange = isNegativeOrZeroPriceChange(startingPrice, currentPrice);

        uint buyBackRandomNumber = getPseudoRandomNumber(buyBackChanceLowerLimit, buyBackChanceUpperLimit);
        lastBuyBackChance = buyBackChance;
        lastBuyBackChoice = buyBackRandomNumber;

        if (block.timestamp >= baseTrackingPeriodEnd && _isNegativeOrZeroPriceChange && buyBackRandomNumber < buyBackChance) {
            isBuyBackNeeded = true;
        } else if (block.timestamp >= baseTrackingPeriodEnd && _isNegativeOrZeroPriceChange) {
            buyBackChance = buyBackChance + buyBackChanceIncrement;
        }

    }

    function getPriceDataEntriesLength() public view onlyOwner returns (uint256) {
        return priceDataEntries.length;
    }

    function getStartingEntryIndex(uint256 lastEntryIndex) public view onlyOwner returns (uint256) {
        if (lastEntryIndex < daysInEpoch) {
            return 0;
        }
        return lastEntryIndex - daysInEpoch;
    }

    function getPriceFromDataEntry(uint256 priceDataIndex) public view onlyOwner returns (uint256) {
        return priceDataEntries[priceDataIndex].price;
    }

    function getPrice() public view onlyOwner returns (uint256) {
//        if current trend is using a specific consumer, keep using that consumer
        if (priceDataEntries.length > 0) {
            return trackingPeriodPriceConsumer.getPrice();
        } else {
            return priceConsumer.getPrice();
        }
    }

    function isNegativeOrZeroPriceChange(uint256 startPrice, uint256 endPrice) public pure returns (bool){
        return endPrice <= startPrice;
    }

    function getLastBuyBackChoiceResults() public view onlyOwner returns (uint, uint) {
        return (lastBuyBackChance, lastBuyBackChoice);
    }

    function checkUpkeep(bytes calldata /* checkData */) external view override returns (bool needed, bytes memory /* performData */) {
        needed = marketTrendKeeperHelper.upkeepNeeded(lastTimeStamp, interval);
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        if (marketTrendKeeperHelper.upkeepNeeded(lastTimeStamp, interval)) {

            processCurrentMarketTrend();

            if (_isNegativeOrZeroPriceChange) {
                farmTreasury.addAccruedInterestToBuyBackPool();
                _isNegativeOrZeroPriceChange = false;
            }

            if (isBuyBackNeeded) {
                farmTreasury.doBuyBack();
                uint randomNumberOfEpochs = getPseudoRandomNumber(amountOfEpochsLowerLimit, amountOfEpochsUpperLimit);
                uint _baseTrackingPeriodEnd = block.timestamp + (randomNumberOfEpochs * daysInEpoch * 1 days);
                createTrackingPeriod(block.timestamp, _baseTrackingPeriodEnd);
                lastBuyBackTimestamp = block.timestamp;
                isBuyBackNeeded = false;
            }

            //        1 day give or take 15 minutes
            interval = getPseudoRandomNumber(85500, 87300);
            lastTimeStamp = block.timestamp;
        }
    }

}
