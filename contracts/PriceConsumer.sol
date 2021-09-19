// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PriceConsumer is Ownable {

    AggregatorV3Interface internal priceFeed;

    constructor(address _aggregatorAddress) {
        priceFeed = AggregatorV3Interface(_aggregatorAddress);
    }

    function setPriceFeed(address _aggregatorAddress) public onlyOwner {
        priceFeed = AggregatorV3Interface(_aggregatorAddress);
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

}
