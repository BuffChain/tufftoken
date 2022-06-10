// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.0;

// A solidity v6 interface wrapper for our UniswapPriceConsumer
interface IUniswapPriceConsumer {
    function getTvbtWethQuote(
        uint32 _period
    ) external view returns (uint256 quoteAmt, uint128 decimalPrecision);
}
