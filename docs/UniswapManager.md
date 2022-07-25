# Solidity API

## UniswapManager


Uniswap utility contract to help with token swaps. Based on these docs
https://docs.uniswap.org/protocol/guides/swaps





### onlyOwner

```solidity
modifier onlyOwner()
```



_functions with the onlyOwner modifier can only be called by the contract itself or the contract owner_




### isUniswapManagerInit

```solidity
function isUniswapManagerInit() public view returns (bool)
```







### initUniswapManager

```solidity
function initUniswapManager(contract ISwapRouter _swapRouter, address wethAddr, uint24 basePoolFee) public
```

Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment

_modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _swapRouter | contract ISwapRouter | swap router address |
| wethAddr | address | WETH address |
| basePoolFee | uint24 | uniswap base pool fee |



### swapExactInputSingle

```solidity
function swapExactInputSingle(address inputToken, address outputToken, uint24 poolFee, uint256 amountIn, uint256 amountOutMinimum) external returns (uint256 amountOut)
```

swapExactOutputSingle swaps a minimum possible amount of DAI for a fixed amount of WETH.

_The calling address must approve this contract to spend its DAI for this function to succeed. As the amount of input DAI is variable,
 the calling address will need to approve for a slightly higher amount, anticipating some variance.
modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| inputToken | address |  |
| outputToken | address |  |
| poolFee | uint24 |  |
| amountIn | uint256 | The exact amount of `outputToken` to receive from the swap. |
| amountOutMinimum | uint256 |  |

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountOut | uint256 | The amount of DAI actually spent in the swap. |


### swapExactOutputSingle

```solidity
function swapExactOutputSingle(address inputToken, address outputToken, uint24 poolFee, uint256 amountOut, uint256 amountInMaximum) external returns (uint256 amountIn)
```

swapExactOutputSingle swaps a minimum possible amount of DAI for a fixed amount of WETH.

_The calling address must approve this contract to spend its DAI for this function to succeed. As the amount of input DAI is variable,
 the calling address will need to approve for a slightly higher amount, anticipating some variance.
modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| inputToken | address |  |
| outputToken | address |  |
| poolFee | uint24 |  |
| amountOut | uint256 | The exact amount of WETH9 to receive from the swap. |
| amountInMaximum | uint256 | The amount of DAI we are willing to spend to receive the specified amount of WETH9. |

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountIn | uint256 | The amount of DAI actually spent in the swap. |


### swapExactInputMultihop

```solidity
function swapExactInputMultihop(address inputToken, address outputToken, uint24 poolAFee, uint24 poolBFee, uint256 amountIn, uint256 amountOutMinimum) external returns (uint256)
```

based on https://docs.uniswap.org/protocol/guides/swaps/multihop-swaps

_modifier onlyOwner can only be called by the contract itself or the contract owner_





