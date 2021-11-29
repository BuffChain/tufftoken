// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./v7/IPriceConsumer.sol";
import {ChainLinkPriceConsumerLib} from "./ChainLinkPriceConsumerLib.sol";

contract ChainLinkPriceConsumer is IPriceConsumer {
    modifier initChainLinkPriceConsumerLock() {
        require(isChainLinkPriceConsumerInit(), string(abi.encodePacked(ChainLinkPriceConsumerLib.NAMESPACE, ": ", "UNINITIALIZED")));
        _;
    }

    function isChainLinkPriceConsumerInit() public view returns (bool) {
        ChainLinkPriceConsumerLib.StateStorage storage ss = ChainLinkPriceConsumerLib.getState();
        return ss.isInit;
    }

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initChainLinkPriceConsumer(address _aggregatorAddress) public {
        require(!isChainLinkPriceConsumerInit(), string(abi.encodePacked(ChainLinkPriceConsumerLib.NAMESPACE, ": ", "ALREADY_INITIALIZED")));

        ChainLinkPriceConsumerLib.StateStorage storage ss = ChainLinkPriceConsumerLib.getState();

        ss.priceFeed = AggregatorV3Interface(_aggregatorAddress);
        ss.isInit = true;
    }

    function setPriceFeed(address _aggregatorAddress) public initChainLinkPriceConsumerLock {
        ChainLinkPriceConsumerLib.StateStorage storage ss = ChainLinkPriceConsumerLib.getState();
        ss.priceFeed = AggregatorV3Interface(_aggregatorAddress);
    }

    function getLatestRoundData() public view initChainLinkPriceConsumerLock returns (uint80, int, uint, uint, uint80) {
        ChainLinkPriceConsumerLib.StateStorage storage ss = ChainLinkPriceConsumerLib.getState();
        return ss.priceFeed.latestRoundData();
    }

    function getPrice() external view override initChainLinkPriceConsumerLock returns (uint256) {
        (,int price,,,) = getLatestRoundData();
        return uint256(price);
    }
}
