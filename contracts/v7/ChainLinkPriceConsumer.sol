// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.7.0;

import "@chainlink/contracts/src/v0.7/interfaces/AggregatorV3Interface.sol";

contract ChainLinkPriceConsumer {

    function getLatestRoundData(address _aggregatorAddr)
    public
    view
    returns (
        uint80,
        int256,
        uint256,
        uint256,
        uint80
    )
    {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(_aggregatorAddr);
        return priceFeed.latestRoundData();
    }

    function getDecimals(address _aggregatorAddr)
    public
    view
    returns (
        uint8
    )
    {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(_aggregatorAddr);
        return priceFeed.decimals();
    }

    function getChainLinkPrice(address _aggregatorAddr)
    external
    view
    returns (uint256)
    {
        (
            /*uint80 roundID*/,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = getLatestRoundData(_aggregatorAddr);
        return uint256(price);
    }
}
