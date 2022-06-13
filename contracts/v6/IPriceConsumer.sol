// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.0;

// A solidity v6 interface wrapper for our UniswapPriceConsumer
interface IPriceConsumer {
    function getTvbtWethQuote(
        uint32 _period
    ) external view returns (uint256 quoteAmt, uint8 decimalPrecision);

    function getChainLinkPrice(address _aggregatorAddr)
    external
    view
    returns (uint256);
}
