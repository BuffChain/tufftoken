# Solidity API

## PriceConsumer








### isPriceConsumerInit

```solidity
function isPriceConsumerInit() public view returns (bool)
```







### initPriceConsumer

```solidity
function initPriceConsumer(address _factoryAddr) public
```







### getTvbtWethQuote

```solidity
function getTvbtWethQuote(uint32 _period) external view returns (uint256, uint128)
```







### getLatestRoundData

```solidity
function getLatestRoundData(address _aggregatorAddr) public view returns (uint80, int256, uint256, uint256, uint80)
```

ChainLink price feed functions





### getDecimals

```solidity
function getDecimals(address _aggregatorAddr) public view returns (uint8)
```







### getChainLinkPrice

```solidity
function getChainLinkPrice(address _aggregatorAddr) external view returns (uint256)
```








