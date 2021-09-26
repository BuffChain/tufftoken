// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import {PriceConsumer} from "./PriceConsumer.sol";


/*
epoch = 7 days
base market trend period = range of 3 to 10 epochs
can buy back when it has been at least base market trend period is met since last buy back and the next epoch trend is bear

Ex: base market trend period = 3 epochs, buy back happens on day x
	- case 4 epochs passed since day x and 4th epoch was bull: buy back = false;
	- case 5 epochs passed since day x and 5th epoch was bear: buy back = true;
*/


contract MarketTrend is Ownable {

    struct TrackingPeriod {
        uint periodStartTimestamp;
        uint periodEndTimeStamp;
        RoundData startRoundData;
        RoundData endRoundData;
        bool isActive;
    }

    struct RoundData {
        uint80 roundID;
        int price;
        uint startedAt;
        uint timeStamp;
        uint80 answeredInRound;
    }

    PriceConsumer priceConsumer;
    TrackingPeriod[] trackingPeriods;
    uint rangeStart = 30;
    uint rangeEnd = 90;

    constructor(address _priceConsumerAddr) {
        priceConsumer = PriceConsumer(_priceConsumerAddr);
        createTrackingPeriod();
    }

    function getRangeStart() public view onlyOwner returns (uint) {
        return rangeStart;
    }

    function setRangeStart(uint _rangeStart) public onlyOwner {
        rangeStart = _rangeStart;
    }

    function getRangeEnd() public view onlyOwner returns (uint) {
        return rangeEnd;
    }

    function setRangeEnd(uint _rangeEnd) public onlyOwner {
        rangeEnd = _rangeEnd;
    }

    function getPseudoRandomNumber(uint _rangeStart, uint _rangeEnd) private view returns (uint) {
        uint randomNumber = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % _rangeEnd;
        randomNumber = randomNumber + _rangeStart;
        return randomNumber;
    }

    function getCurrentTrackingPeriodIndex() public view onlyOwner returns (uint256) {
        return trackingPeriods.length - 1;
    }

    function getTrackingPeriodMetaData(uint256 trackingPeriodIndex) public view onlyOwner returns (
        uint256,
        uint256,
        bool
    )
    {
        TrackingPeriod memory trackingPeriod = trackingPeriods[trackingPeriodIndex];
        return (
            trackingPeriod.periodStartTimestamp,
            trackingPeriod.periodEndTimeStamp,
            trackingPeriod.isActive
        );
    }

    function getTrackingPeriodRoundData(uint256 trackingPeriodIndex, bool startData) public view onlyOwner returns (
        uint80,
        int,
        uint,
        uint,
        uint80
    )
    {
        TrackingPeriod memory trackingPeriod = trackingPeriods[trackingPeriodIndex];
        RoundData memory roundData;
        if (startData) {
            roundData = trackingPeriod.startRoundData;
        } else {
            roundData = trackingPeriod.endRoundData;
        }
        return (roundData.roundID, roundData.price, roundData.startedAt, roundData.timeStamp, roundData.answeredInRound);
    }

    function createTrackingPeriod() public onlyOwner {
        require(
            trackingPeriods.length == 0 ||
            !trackingPeriods[trackingPeriods.length - 1].isActive,
            "Can only have one active tracking period."
        );
        uint randomNumberOfDays = getPseudoRandomNumber(getRangeStart(), getRangeEnd());
        uint periodStartTimestamp = block.timestamp;
        uint periodEndTimeStamp = periodStartTimestamp + (randomNumberOfDays * 1 days);

        (
            uint80 roundID,
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = priceConsumer.getLatestRoundData();

        RoundData memory startRoundData = RoundData(
            roundID,
            price,
            startedAt,
            timeStamp,
            answeredInRound
        );

        TrackingPeriod memory trackingPeriod;
        trackingPeriod.periodStartTimestamp = periodStartTimestamp;
        trackingPeriod.periodEndTimeStamp = periodEndTimeStamp;
        trackingPeriod.startRoundData = startRoundData;
        trackingPeriod.isActive = true;

        trackingPeriods.push(trackingPeriod);

    }

    function hasTrackingPeriodEnded(uint256 trackingPeriodIndex) public view onlyOwner returns (bool) {
        return block.timestamp >= trackingPeriods[trackingPeriodIndex].periodEndTimeStamp;
    }

    function completeTrackingPeriod(uint256 trackingPeriodIndex) public onlyOwner  {
        require(trackingPeriods[trackingPeriodIndex].isActive, "Cannot complete an inactive tracking period.");
        (
            uint80 roundID,
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = priceConsumer.getLatestRoundData();

        RoundData memory endRoundData = RoundData(
            roundID,
            price,
            startedAt,
            timeStamp,
            answeredInRound
        );

        trackingPeriods[trackingPeriodIndex].endRoundData = endRoundData;
        trackingPeriods[trackingPeriodIndex].isActive = false;

    }

    function processCurrentTrackingPeriod() public onlyOwner returns (bool) {
        bool _isBuyBackNeeded;
        uint256 currentTrackingPeriodIndex = getCurrentTrackingPeriodIndex();
        if (hasTrackingPeriodEnded(currentTrackingPeriodIndex)) {
            completeTrackingPeriod(currentTrackingPeriodIndex);
            (,int startPrice,,,) = getTrackingPeriodRoundData(currentTrackingPeriodIndex, true);
            (,int endPrice,,,) = getTrackingPeriodRoundData(currentTrackingPeriodIndex, false);
            _isBuyBackNeeded = isBuyBackNeeded(startPrice, endPrice);
            createTrackingPeriod();
        }
        return _isBuyBackNeeded;
    }

    function isBuyBackNeeded(int startPrice, int endPrice) public view onlyOwner returns (bool){
        return endPrice < startPrice;
    }

}
