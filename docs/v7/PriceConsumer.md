# Solidity API

## PriceConsumer


The PriceConsumer contract is responsible for getting aggregated on chain data of current price data from
uniswap and chainlink





### isPriceConsumerInit

```solidity
function isPriceConsumerInit() public view returns (bool)
```







### initPriceConsumer

```solidity
function initPriceConsumer(address _factoryAddr) public
```

Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment


| Name | Type | Description |
| ---- | ---- | ----------- |
| _factoryAddr | address | uniswap v3 factory address |



### getTvbtWethQuote

```solidity
function getTvbtWethQuote(uint32 _period) external view returns (uint256, uint128)
```

gets a VBT / WETH quote from uniswap

Requirements:

- pool of VBT and WETH must exist
- quote amount must be greater than 0


| Name | Type | Description |
| ---- | ---- | ----------- |
| _period | uint32 | period used for tick calculation |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | quote amount |
| [1] | uint128 | decimal precision |


### getLatestRoundData

```solidity
function getLatestRoundData(address _aggregatorAddr) public view returns (uint80, int256, uint256, uint256, uint80)
```

ChainLink price feed functions
gets the latest round of price data given an aggregator of a token pair supported by chainlink


| Name | Type | Description |
| ---- | ---- | ----------- |
| _aggregatorAddr | address | aggregator address |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint80 | latest round data (price) |
| [1] | int256 |  |
| [2] | uint256 |  |
| [3] | uint256 |  |
| [4] | uint80 |  |


### getDecimals

```solidity
function getDecimals(address _aggregatorAddr) public view returns (uint8)
```

get decimals of a given aggregator


| Name | Type | Description |
| ---- | ---- | ----------- |
| _aggregatorAddr | address | aggregator address |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint8 | decimals |


### getChainLinkPrice

```solidity
function getChainLinkPrice(address _aggregatorAddr) external view returns (uint256)
```

gets latest round of price data from an aggregator


| Name | Type | Description |
| ---- | ---- | ----------- |
| _aggregatorAddr | address | aggregator address |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | price |



