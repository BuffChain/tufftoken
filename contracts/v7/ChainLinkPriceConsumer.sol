// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.5.0 <0.8.0;

import "@chainlink/contracts/src/v0.7/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts-v6/access/Ownable.sol";
import "./IPriceConsumer.sol";

contract ChainLinkPriceConsumer is Ownable, IPriceConsumer {

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

    function getPrice() public override view returns (uint256) {
        (,int price,,,) = getLatestRoundData();
        return uint256(price);
    }

}
