// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.0;

// A solidity v6 interface wrapper for our ChainLinkPriceConsumer
interface IChainLinkPriceConsumer {
    function getChainLinkPrice(address _aggregatorAddr)
    external
    view
    returns (uint256);
}
