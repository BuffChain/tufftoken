// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.7.0;
pragma abicoder v2;

import {MarketTrendLib} from "./MarketTrendLib.sol";
import {ChainLinkPriceConsumer} from "./ChainLinkPriceConsumer.sol";
import {UniswapPriceConsumer} from "./UniswapPriceConsumer.sol";
import {KeeperCompatibleInterface} from "@chainlink/contracts/src/v0.7/interfaces/KeeperCompatibleInterface.sol";
import {IERC20} from "@openzeppelin/contracts-v6/token/ERC20/IERC20.sol";

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
contract MarketTrend is KeeperCompatibleInterface {
    modifier initMarketTrendLock() {
        require(
            isMarketTrendInit(),
            string(
                abi.encodePacked(
                    MarketTrendLib.NAMESPACE,
                    ": ",
                    "UNINITIALIZED"
                )
            )
        );
        _;
    }

    function isMarketTrendInit() public view returns (bool) {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return ss.isInit;
    }

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initMarketTrend(
        MarketTrendLib.PriceConsumer priceConsumer,
        bool createInitialTrackingPeriod
    ) public {
        require(
            !isMarketTrendInit(),
            string(
                abi.encodePacked(
                    MarketTrendLib.NAMESPACE,
                    ": ",
                    "ALREADY_INITIALIZED"
                )
            )
        );

        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        ss.daysInEpoch = 7;
        ss.amountOfEpochsLowerLimit = 4;
        ss.amountOfEpochsUpperLimit = 10;
        ss.buyBackChanceIncrement = 10;
        ss.buyBackChanceLowerLimit = 1;
        ss.buyBackChanceUpperLimit = 100;

        ss.priceConsumer = priceConsumer;

        ss.interval = 86400; // starts at 1 day
        ss.lastTimeStamp = block.timestamp;

        if (createInitialTrackingPeriod) {
            uint256 randomNumberOfEpochs = getPseudoRandomNumber(
                ss.amountOfEpochsLowerLimit,
                ss.amountOfEpochsUpperLimit
            );
            uint256 baseTrackingPeriodEnd = block.timestamp +
                (randomNumberOfEpochs * ss.daysInEpoch * 1 days);
            createTrackingPeriod(block.timestamp, baseTrackingPeriodEnd);
        }

        ss.isInit = true;
    }

    //    This will only take effect on next tracking period
    function setPriceConsumer(MarketTrendLib.PriceConsumer priceConsumer)
        public
        initMarketTrendLock
    {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        ss.priceConsumer = priceConsumer;
    }

    function getPriceConsumer()
        public
        view
        initMarketTrendLock
        returns (MarketTrendLib.PriceConsumer)
    {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return ss.priceConsumer;
    }

    function setInterval(uint256 _interval) public initMarketTrendLock {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        ss.interval = _interval;
    }

    function getInterval() public view returns (uint256) {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return ss.interval;
    }

    function setLastTimestamp(uint256 _lastTimeStamp)
        public
        initMarketTrendLock
    {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        ss.lastTimeStamp = _lastTimeStamp;
    }

    function getLastTimestamp() public view returns (uint256) {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return ss.lastTimeStamp;
    }

    function setDaysInEpoch(uint256 _daysInEpoch) public initMarketTrendLock {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        ss.daysInEpoch = _daysInEpoch;
    }

    function getDaysInEpoch()
        public
        view
        initMarketTrendLock
        returns (uint256)
    {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return ss.daysInEpoch;
    }

    function setAmountOfEpochsLowerLimit(uint256 _amountOfEpochsLowerLimit)
        public
        initMarketTrendLock
    {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        ss.amountOfEpochsLowerLimit = _amountOfEpochsLowerLimit;
    }

    function getAmountOfEpochsLowerLimit()
        public
        view
        initMarketTrendLock
        returns (uint256)
    {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return ss.amountOfEpochsLowerLimit;
    }

    function setAmountOfEpochsUpperLimit(uint256 _amountOfEpochsUpperLimit)
        public
        initMarketTrendLock
    {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        ss.amountOfEpochsUpperLimit = _amountOfEpochsUpperLimit;
    }

    function setAmountOfEpochsUpperLimit()
        public
        view
        initMarketTrendLock
        returns (uint256)
    {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return ss.amountOfEpochsUpperLimit;
    }

    function getTrackingPeriodStart() public view returns (uint256) {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return ss.trackingPeriodStart;
    }

    function getLastBuyBackTimestamp() public view returns (uint256) {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return ss.lastBuyBackTimestamp;
    }

    function getIsBuyBackNeeded() public view returns (bool) {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return ss.isBuyBackNeeded;
    }

    function getIsNegativeOrZeroPriceChange() public view returns (bool) {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return ss.isNegativeOrZeroPriceChange;
    }

    function getPseudoRandomNumber(uint256 _rangeStart, uint256 _rangeEnd)
        public
        view
        initMarketTrendLock
        returns (uint256)
    {
        uint256 randomNumber = uint256(
            keccak256(
                abi.encodePacked(block.timestamp, block.difficulty, msg.sender)
            )
        ) % _rangeEnd;
        randomNumber = randomNumber + _rangeStart;
        return randomNumber;
    }

    function createTrackingPeriod(
        uint256 _trackingPeriodStart,
        uint256 baseTrackingPeriodEnd
    ) public initMarketTrendLock {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();

        delete ss.priceDataEntries;

        MarketTrendLib.PriceData memory priceData;
        priceData.price = getPrice();
        priceData.timestamp = _trackingPeriodStart;
        ss.priceDataEntries.push(priceData);

        ss.trackingPeriodStart = _trackingPeriodStart;
        ss.baseTrackingPeriodEnd = baseTrackingPeriodEnd;
        ss.trackingPeriodPriceConsumer = ss.priceConsumer;
        ss.buyBackChance = ss.buyBackChanceIncrement;
    }

    function pushPriceData(uint256 timestamp, uint256 currentPrice)
        public
        initMarketTrendLock
    {
        MarketTrendLib.PriceData memory currentPriceData;
        currentPriceData.price = currentPrice;
        currentPriceData.timestamp = timestamp;

        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        ss.priceDataEntries.push(currentPriceData);
    }

    function processCurrentMarketTrend() public initMarketTrendLock {
        processMarketTrend(block.timestamp, getPrice());
    }

    function processMarketTrend(uint256 timestamp, uint256 currentPrice)
        public
        initMarketTrendLock
    {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();

        pushPriceData(timestamp, currentPrice);

        uint256 lastEntryIndex = getPriceDataEntriesLength() - 1;
        uint256 startingEntryIndex = getStartingEntryIndex(lastEntryIndex);

        uint256 startingPrice = getPriceFromDataEntry(startingEntryIndex);

        ss.isNegativeOrZeroPriceChange = currentPrice <= startingPrice;

        uint256 buyBackRandomNumber = getPseudoRandomNumber(
            ss.buyBackChanceLowerLimit,
            ss.buyBackChanceUpperLimit
        );
        ss.lastBuyBackChance = ss.buyBackChance;
        ss.lastBuyBackChoice = buyBackRandomNumber;

        if (
            timestamp >= ss.baseTrackingPeriodEnd &&
            ss.isNegativeOrZeroPriceChange &&
            buyBackRandomNumber < ss.buyBackChance
        ) {
            ss.isBuyBackNeeded = true;
        } else if (
            timestamp >= ss.baseTrackingPeriodEnd &&
            ss.isNegativeOrZeroPriceChange
        ) {
            ss.buyBackChance = ss.buyBackChance + ss.buyBackChanceIncrement;
        }
    }

    function getPriceDataEntriesLength()
        public
        view
        initMarketTrendLock
        returns (uint256)
    {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return ss.priceDataEntries.length;
    }

    function getStartingEntryIndex(uint256 lastEntryIndex)
        public
        view
        initMarketTrendLock
        returns (uint256)
    {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        if (lastEntryIndex < ss.daysInEpoch) {
            return 0;
        }
        return lastEntryIndex - ss.daysInEpoch;
    }

    function getPriceFromDataEntry(uint256 priceDataIndex)
        public
        view
        initMarketTrendLock
        returns (uint256)
    {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return ss.priceDataEntries[priceDataIndex].price;
    }

    function getPrice() public view initMarketTrendLock returns (uint256) {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        //        if current trend is using a specific consumer, keep using that consumer
        if (ss.priceDataEntries.length > 0) {
            return getPriceFromPriceConsumer(ss.trackingPeriodPriceConsumer);
        } else {
            return getPriceFromPriceConsumer(ss.priceConsumer);
        }
    }

    function getPriceFromPriceConsumer(
        MarketTrendLib.PriceConsumer priceConsumer
    ) public view initMarketTrendLock returns (uint256) {
        if (priceConsumer == MarketTrendLib.PriceConsumer.CHAINLINK) {
            return ChainLinkPriceConsumer(address(this)).getChainLinkPrice();
        } else if (priceConsumer == MarketTrendLib.PriceConsumer.UNISWAP) {
            return UniswapPriceConsumer(address(this)).getUniswapPrice();
        } else {
            revert("A valid price consumer class was not provided");
        }
    }

    function getLastBuyBackChoiceResults()
        public
        view
        initMarketTrendLock
        returns (uint256, uint256)
    {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return (ss.lastBuyBackChance, ss.lastBuyBackChoice);
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        initMarketTrendLock
        returns (
            bool needed,
            bytes memory /* performData */
        )
    {
        needed = isIntervalComplete();
    }

    function isIntervalComplete()
        private
        view
        initMarketTrendLock
        returns (bool)
    {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();
        return (block.timestamp - ss.lastTimeStamp) > ss.interval;
    }

    function runMarketTrendIntervalJob() public {
        MarketTrendLib.StateStorage storage ss = MarketTrendLib.getState();

        processCurrentMarketTrend();

        if (ss.isNegativeOrZeroPriceChange) {
            addAccruedInterestToBuyBackPool();
            ss.isNegativeOrZeroPriceChange = false;
        } else {
            depositAccruedInterestToLendingPools();
        }

        if (ss.isBuyBackNeeded) {
            doBuyBack();
            uint256 randomNumberOfEpochs = getPseudoRandomNumber(
                ss.amountOfEpochsLowerLimit,
                ss.amountOfEpochsUpperLimit
            );
            uint256 _baseTrackingPeriodEnd = block.timestamp +
                (randomNumberOfEpochs * ss.daysInEpoch * 1 days);
            createTrackingPeriod(block.timestamp, _baseTrackingPeriodEnd);
            ss.lastBuyBackTimestamp = block.timestamp;
            ss.isBuyBackNeeded = false;
        }

        //        1 day give or take 15 minutes
        ss.interval = getPseudoRandomNumber(85500, 87300);
        ss.lastTimeStamp = block.timestamp;
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override initMarketTrendLock {
        if (isIntervalComplete()) {
            runMarketTrendIntervalJob();
            //    todo: check contract maturity & liquidate
            //    todo: run self balancing / use fees collected to add to LPs
        }
    }

    function doBuyBack() private initMarketTrendLock {}

    function addAccruedInterestToBuyBackPool() private initMarketTrendLock {}

    function depositAccruedInterestToLendingPools()
        private
        initMarketTrendLock
    {}
}
