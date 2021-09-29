// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./v7/IPriceConsumer.sol";

contract ChainLinkPriceConsumer is Ownable, IPriceConsumer {

    AggregatorV3Interface internal priceFeed;

    constructor(address initialOwner, address _aggregatorAddress) {
        priceFeed = AggregatorV3Interface(_aggregatorAddress);
        transferOwnership(initialOwner);
    }

    function setPriceFeed(address _aggregatorAddress) public onlyOwner {
        priceFeed = AggregatorV3Interface(_aggregatorAddress);
    }

    function getLatestRoundData() public view onlyOwner returns (
        uint80,
        int,
        uint,
        uint,
        uint80
    ) {

        return priceFeed.latestRoundData();

    }

    function getPrice() public override view onlyOwner returns (uint256) {
        (,int price,,,) = getLatestRoundData();
        return uint256(price);
    }

}
