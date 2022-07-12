# Solidity API

## IPriceConsumer


UniswapManager interface used for cross solidity versions (v6 - v7)





### getTvbtWethQuote

```solidity
function getTvbtWethQuote(uint32 _period) external view returns (uint256 quoteAmt, uint8 decimalPrecision)
```







### getChainLinkPrice

```solidity
function getChainLinkPrice(address _aggregatorAddr) external view returns (uint256)
```








