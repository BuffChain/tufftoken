// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.7.0;

import "@chainlink/contracts/src/v0.7/interfaces/AggregatorV3Interface.sol";

import {ChainLinkPriceConsumerLib} from "./ChainLinkPriceConsumerLib.sol";

contract ChainLinkPriceConsumer {
    modifier initChainLinkPriceConsumerLock() {
        require(
            isChainLinkPriceConsumerInit(),
            string(
                abi.encodePacked(
                    ChainLinkPriceConsumerLib.NAMESPACE,
                    ": ",
                    "UNINITIALIZED"
                )
            )
        );
        _;
    }

    function isChainLinkPriceConsumerInit() public view returns (bool) {
        ChainLinkPriceConsumerLib.StateStorage
            storage ss = ChainLinkPriceConsumerLib.getState();
        return ss.isInit;
    }

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initChainLinkPriceConsumer(address _aggregatorAddr) public {
        require(
            !isChainLinkPriceConsumerInit(),
            string(
                abi.encodePacked(
                    ChainLinkPriceConsumerLib.NAMESPACE,
                    ": ",
                    "ALREADY_INITIALIZED"
                )
            )
        );

        ChainLinkPriceConsumerLib.StateStorage
            storage ss = ChainLinkPriceConsumerLib.getState();

        ss.priceFeed = AggregatorV3Interface(_aggregatorAddr);
        ss.isInit = true;
    }

    function setPriceFeed(address _aggregatorAddr)
        public
        initChainLinkPriceConsumerLock
    {
        ChainLinkPriceConsumerLib.StateStorage
            storage ss = ChainLinkPriceConsumerLib.getState();
        ss.priceFeed = AggregatorV3Interface(_aggregatorAddr);
    }

    function getLatestRoundData()
        public
        view
        initChainLinkPriceConsumerLock
        returns (
            uint80,
            int256,
            uint256,
            uint256,
            uint80
        )
    {
        ChainLinkPriceConsumerLib.StateStorage
            storage ss = ChainLinkPriceConsumerLib.getState();
        return ss.priceFeed.latestRoundData();
    }

    function getChainLinkPrice()
        external
        view
        initChainLinkPriceConsumerLock
        returns (uint256)
    {
        (, int256 price, , , ) = getLatestRoundData();
        return uint256(price);
    }
}
