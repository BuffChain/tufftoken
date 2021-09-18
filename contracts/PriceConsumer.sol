// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PriceConsumer is Ownable {

    struct PrevRoundData {
        uint80 roundID;
        int price;
        uint startedAt;
        uint timeStamp;
        uint80 answeredInRound;
    }

    AggregatorV3Interface internal priceFeed;
    PrevRoundData public prevRoundData;

    constructor(address _aggregatorAddress) public {
        priceFeed = AggregatorV3Interface(_aggregatorAddress);
    }

    function setPriceFeed(address _aggregatorAddress) public onlyOwner {
        priceFeed = AggregatorV3Interface(_aggregatorAddress);
        setPrevRoundData(0, 0, 0, 0, 0);
    }

    function getLatestRoundData() public view returns (
        uint80,
        int,
        uint,
        uint,
        uint80
    ) {

        return priceFeed.latestRoundData();

    }

    function getPrevRoundData() public view returns (
        uint80,
        int,
        uint,
        uint,
        uint80
    ) {

        return (
            prevRoundData.roundID,
            prevRoundData.price,
            prevRoundData.startedAt,
            prevRoundData.timeStamp,
            prevRoundData.answeredInRound
        );
    }

    function setPrevRoundData(
        uint80 _roundID,
        int _price,
        uint _startedAt,
        uint _timeStamp,
        uint80 _answeredInRound) public onlyOwner {

        prevRoundData = PrevRoundData(
            _roundID,
            _price,
            _startedAt,
            _timeStamp,
            _answeredInRound
        );

    }

}
