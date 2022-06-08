# Solidity API

## UniswapPriceConsumer

### onlyOwner

```solidity
modifier onlyOwner()
```

### uniswapPriceConsumerInitLock

```solidity
modifier uniswapPriceConsumerInitLock()
```

### isUniswapPriceConsumerInit

```solidity
function isUniswapPriceConsumerInit() public view returns (bool)
```

### initUniswapPriceConsumer

```solidity
function initUniswapPriceConsumer(address _factoryAddr) public
```

### getUniswapQuote

```solidity
function getUniswapQuote(address _tokenA, address _tokenB, uint24 _fee, uint32 _period) external view returns (uint256 quoteAmount)
```

