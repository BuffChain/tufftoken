# Solidity API

## TokenMaturity


TokenMaturity contract is responsible for keeping track of the tokens life cycle and maturity.
The TuffKeeper contract makes calls to the isTokenMatured function regularly to determine if maturity has been
reached.  If it has, TuffKeeper will then make another call to onTokenMaturity which handles liquidating the TuffVBT
treasury into a redeemable asset





### onlyOwner

```solidity
modifier onlyOwner()
```



_functions with the onlyOwner modifier can only be called by the contract itself or the contract owner_




### initTokenMaturity

```solidity
function initTokenMaturity(uint256 daysUntilMaturity) public
```

Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment

_modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| daysUntilMaturity | uint256 | amount of days until the TuffVBT token instance reaches maturity and can be redeemed |



### TokenMatured

```solidity
event TokenMatured(uint256 balance, uint256 totalSupply)
```



_Emitted when treasury has been liquidated
with the contract's ETH balance and total supply of redeemable tokens_




### Redeemed

```solidity
event Redeemed(address holder, uint256 tuffBalance, uint256 ethAmount)
```



_Emitted when holder redeems tokens for ETH_




### isTokenMaturityInit

```solidity
function isTokenMaturityInit() public view returns (bool)
```







### getContractMaturityTimestamp

```solidity
function getContractMaturityTimestamp() public view returns (uint256)
```

get the contracts maturity timestamp



| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | contractMaturityTimestamp |


### setContractMaturityTimestamp

```solidity
function setContractMaturityTimestamp(uint256 timestamp) public
```

set the contracts maturity timestamp

_modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| timestamp | uint256 | contract maturity timestamp |



### isTokenMatured

```solidity
function isTokenMatured(uint256 timestamp) public view returns (bool)
```

check if a timestamp is greater than or equal to contractMaturityTimestamp


| Name | Type | Description |
| ---- | ---- | ----------- |
| timestamp | uint256 | timestamp to check against contract maturity timestamp |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool is matured |


### totalSupplyForRedemption

```solidity
function totalSupplyForRedemption() public view returns (uint256)
```

returns the total amount of VBT supply at the time of maturity



| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | total VBT supply |


### setTotalSupplyForRedemption

```solidity
function setTotalSupplyForRedemption(uint256 _totalSupplyForRedemption) public
```

set the total VBT supply upon token maturity

_modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _totalSupplyForRedemption | uint256 | total VBT supply |



### getContractStartingEthBalance

```solidity
function getContractStartingEthBalance() public view returns (uint256)
```

gets the contract ETH balance at time of maturity



| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | startingEthBalance |


### setContractStartingEthBalance

```solidity
function setContractStartingEthBalance(uint256 startingEthBalance) public
```

sets the contract ETH balance at time of maturity

_modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| startingEthBalance | uint256 | eth balance at time of maturity |



### getRedemptionAmount

```solidity
function getRedemptionAmount(uint256 ownerBalance) public view returns (uint256)
```

calculates the redemption amount in ETH given a VBT balance.

Redemption Amount = Contract ETH balance at time of maturity * amount of VBT held / total VBT supply


| Name | Type | Description |
| ---- | ---- | ----------- |
| ownerBalance | uint256 | amount of VBT to calculate redemption amount for |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | redemption amount given VBT amount |


### getIsTreasuryLiquidated

```solidity
function getIsTreasuryLiquidated() public view returns (bool)
```

checks to see if VBT treasury has been fully liquidated



| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | isTreasuryLiquidated |


### setIsTreasuryLiquidated

```solidity
function setIsTreasuryLiquidated(bool _isTreasuryLiquidated) public
```

sets isTreasuryLiquidated when treasury has been fully liquidated

_modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _isTreasuryLiquidated | bool | bool is treasury liquidated |



### redeem

```solidity
function redeem() public
```

redemption function callable by VBT holder. Only redeemable once.

calculates msg sender's VBT balance and redemption amount in ETH. Redemption amount is transferred to holder
and the msg sender's VBT balance is then burned.

Emits a {Redeemed} event.

Requirements:

- VBT must have reached maturity
- VBT treasury must be fully liquidated
- msg sender (holder) must have not already redeemed
- msg sender (holder) must have a balance of VBT





### hasRedeemed

```solidity
function hasRedeemed(address account) public view returns (bool, uint256)
```

checks to see if an address has already redeemed


| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | address to check if they have already redeemed |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool has already redeemed |
| [1] | uint256 | amount redeemed |


### balanceOfEth

```solidity
function balanceOfEth(address account) public view returns (uint256)
```

address balance of ETH



| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | balance |


### getCurrentContractEthBalance

```solidity
function getCurrentContractEthBalance() public view returns (uint256)
```

gets contracts current ETH balance



| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | balance |


### onTokenMaturity

```solidity
function onTokenMaturity() public
```

called via perform upkeep once current timestamp >= contract maturity timestamp

_modifier onlyOwner can only be called by the contract itself or the contract owner

- Liquidates VBT Treasury
- If treasury is fully liquidated, sets Starting Contract ETH balance to be used in redemption calculations
- If treasury is fully liquidated, Sets VBT total redeemable supply

Emits a {TokenMatured} event. (if treasury is fully liquidated)

Requirements:

- VBT must have reached maturity_




### liquidateTreasury

```solidity
function liquidateTreasury() public
```

function responsible for liquidating the VBT treasury.

_modifier onlyOwner can only be called by the contract itself or the contract owner

- Liquidates Aave Treasury
- For each VBT supported token, swap for WETH
- Unwrap WETH to ETH
- If all assets are liquidated, set isTreasuryLiquidated to true_




### swapForWETH

```solidity
function swapForWETH(address token, uint256 amount) public returns (uint256)
```

swaps for WETH and returns new asset balance. Uses Uniswap to execute the swap.

_modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | token to swap for WETH |
| amount | uint256 | amount of token to swamp |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | contract's new token balance |


### unwrapWETH

```solidity
function unwrapWETH() public returns (uint256)
```

unwraps WETH and returns remaining WETH balance.

_modifier onlyOwner can only be called by the contract itself or the contract owner_


| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | contract's WETH balance |



