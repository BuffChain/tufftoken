# Solidity API

## AaveLPManager


The purpose of the AaveLPManager contract is to manage all deposit and withdraw functions to Aave as well
as keeping a balanced treasury based on targeted weights of the VBT supported tokens.

The BalanceMetadata struct not only helps organize similar values, but it also prevents a 'stack too deep' error.

_Within this contract is a purposeful difference between percentage and weight. Percentage is a token value out of
100% of the total, weight decides how much influence a token should have on the total_




### onlyOwner

```solidity
modifier onlyOwner()
```



_functions with the onlyOwner modifier can only be called by the contract itself or the contract owner_




### BalanceMetadata








```solidity
struct BalanceMetadata {
  address[] supportedTokens;
  uint256[] tokensValueInWeth;
  uint256[] tokensTargetWeight;
  uint256 totalTargetWeight;
  uint256 totalBalanceInWeth;
  uint24 balanceBufferPercent;
  uint256 treasuryBalance;
  uint24 decimalPrecision;
}
```

### initAaveLPManager

```solidity
function initAaveLPManager(address _lendingPoolProviderAddr, address _protocolDataProviderAddr, address _wethAddr, uint24 _balanceBufferPercent) public
```

Basically a constructor, but Diamonds use their own state which the constructor of a contract is not a part of.
We imitate a constructor with a one-time only function. This is called immediately after deployment

_modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _lendingPoolProviderAddr | address | address of lending pool provider |
| _protocolDataProviderAddr | address | address of protocol data provider |
| _wethAddr | address | WETH address |
| _balanceBufferPercent | uint24 | amount of tolerable difference between target weights and actual held percentages of tokens with regards to total treasury balance |



### isAaveInit

```solidity
function isAaveInit() public view returns (bool)
```







### getAaveLPAddr

```solidity
function getAaveLPAddr() public view returns (address)
```

gets address of lending pool



| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | pool address |


### getProtocolDataProviderAddr

```solidity
function getProtocolDataProviderAddr() public view returns (address)
```

gets protocol data provider address



| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | protocol data provider address |


### getBalanceBufferPercent

```solidity
function getBalanceBufferPercent() public view returns (uint24)
```

gets tolerable difference between target weights and actual held percentages



| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint24 | balanceBufferPercent |


### setBalanceBufferPercent

```solidity
function setBalanceBufferPercent(uint24 _balanceBufferPercent) public
```

sets tolerable difference between target weights and actual held percentages

_modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _balanceBufferPercent | uint24 | balance buffer |



### getAllAaveSupportedTokens

```solidity
function getAllAaveSupportedTokens() public view returns (address[])
```

gets all supported tokens used in Aave lending



| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address[] | array of supported token addresses |


### setAaveTokenTargetWeight

```solidity
function setAaveTokenTargetWeight(address tokenAddr, uint24 targetWeight) public
```

sets a target weight of a aave supported token

_modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenAddr | address | token address to set the weight for |
| targetWeight | uint24 | token's target weight |



### getAaveTokenTargetWeight

```solidity
function getAaveTokenTargetWeight(address tokenAddr) public view returns (uint256)
```

gets the target weight of a token


| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenAddr | address | token address to get the weight of |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | token target weight |


### getAaveTokenCurrentPercentage

```solidity
function getAaveTokenCurrentPercentage(address tokenAddr) public view returns (uint256)
```

gets the token's actual held value as percentage of the contracts total portfolio in WETH


| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenAddr | address | token address to calculate |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | token's portfolio percentage |


### getBalanceMetadata

```solidity
function getBalanceMetadata() private view returns (struct AaveLPManager.BalanceMetadata)
```

gets the contracts balance metadata



| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct AaveLPManager.BalanceMetadata | contract balance metadata enriched with supported token balances and their value in WETH |


### getAaveTotalTargetWeight

```solidity
function getAaveTotalTargetWeight() public view returns (uint256)
```

get total token weights



| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | total target weight |


### getAaveIncome

```solidity
function getAaveIncome(address tokenAddr) public view returns (uint256)
```

gets Aave income in the form of aTokens


| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenAddr | address | token address |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | the normalized income per unit of asset |


### getATokenBalance

```solidity
function getATokenBalance(address asset) public view returns (uint256)
```

gets the aToken balance generated from lending the underlying token on Aave

_`asset` is the token address, not aToken address_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | token address |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | balance of aTokens |


### getATokenAddress

```solidity
function getATokenAddress(address asset) public view returns (address)
```

gets the aToken address given the underlying token address

_`asset` is the token address, not aToken address_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | token address |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | address of aToken |


### depositToAave

```solidity
function depositToAave(address erc20TokenAddr, uint256 amount) public
```

deposits specified amount of Aave supported tokens to Aave lending pool

_modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| erc20TokenAddr | address | token address |
| amount | uint256 | amount to deposit |



### isAaveSupportedToken

```solidity
function isAaveSupportedToken(address tokenAddr) public view returns (bool, uint256)
```

check to see if a token supported


| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenAddr | address | token address |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool is token supported |
| [1] | uint256 | token index in supported tokens array |


### addAaveSupportedToken

```solidity
function addAaveSupportedToken(address tokenAddr, address chainlinkEthTokenAggrAddr, uint24 targetWeight) public
```

add a new token to list of supported tokens

_modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenAddr | address | token address |
| chainlinkEthTokenAggrAddr | address | price feed aggregator used to get current on chain price data |
| targetWeight | uint24 | target weight of the asset in the Aave portfolio |



### removeAaveSupportedToken

```solidity
function removeAaveSupportedToken(address tokenAddr) public
```

remove an existing supported token from the list of supported tokens

_modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenAddr | address | token address |



### liquidateAaveTreasury

```solidity
function liquidateAaveTreasury() public returns (bool)
```

liquidates entire Aave treasury (all assets deposited on the Lending Pool). This is done when the VBT
instance reaches maturity in order for the holders VBT to redeem their balance in the form of ETH.

_modifier onlyOwner can only be called by the contract itself or the contract owner_


| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool indicates if ALL deposited assets were successfully withdrawn |


### withdrawFromAave

```solidity
function withdrawFromAave(address erc20TokenAddr, uint256 amount) public returns (uint256)
```

withdraws deposited tokens from Aave Lending Pool

_modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| erc20TokenAddr | address | underlying token address (not aToken) |
| amount | uint256 | amount to withdraw |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | total amount withdrawn |


### withdrawAllFromAave

```solidity
function withdrawAllFromAave(address asset) public
```

withdraw all of an asset from Aave

_modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | underlying token address (not aToken) |



### AaveLPManagerBalanceSwap

```solidity
event AaveLPManagerBalanceSwap(address tokenSwappedFor, uint256 amountIn, uint256 amountOut)
```



_Emitted when a swap occurs to balance an under-balanced token_




### balanceAaveLendingPool

```solidity
function balanceAaveLendingPool() public
```

Responsible for balancing Aave treasury. This is done on an interval managed by the TuffKeeper contract.
We will first need to calculate current/actual percentages, then determine which tokens are under-invested, and
finally swap and deposit to balance the tokens based on their targetedPercentages

Note: Only buy tokens to balance instead of trying to balance by selling first then buying. This means
we do not have to sort, which helps saves on gas.

_modifier onlyOwner can only be called by the contract itself or the contract owner_





