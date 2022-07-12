# Solidity API

## TuffKeeper


This contract is responsible for running core functions are specified intervals. These functions track token
maturity and keeping a balanced treasury.

_Implementation of Chainlink Keeper  https://docs.chain.link/docs/chainlink-keepers/introduction/._




### onlyOwner

```solidity
modifier onlyOwner()
```



_functions with the onlyOwner modifier can only be called by the contract itself or the contract owner_




### isTuffKeeperInit

```solidity
function isTuffKeeperInit() public view returns (bool)
```







### initTuffKeeper

```solidity
function initTuffKeeper() public
```

Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment

_token maturity interval is set to 1 day and balance treasury interval is set to 1 week_




### setTokenMaturityInterval

```solidity
function setTokenMaturityInterval(uint256 _tokenMaturityInterval) public
```

used by contract owner to set token maturity interval

_modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenMaturityInterval | uint256 | interval for checking if VBT has matured |



### getTokenMaturityInterval

```solidity
function getTokenMaturityInterval() public view returns (uint256)
```

gets the token maturity interval



| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | tokenMaturityInterval |


### setBalanceAssetsInterval

```solidity
function setBalanceAssetsInterval(uint256 _balanceAssetsInterval) public
```

used by contract owner to set balance treasury interval

_modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _balanceAssetsInterval | uint256 | interval for balancing treasury |



### getBalanceAssetsInterval

```solidity
function getBalanceAssetsInterval() public view returns (uint256)
```

gets the balance assets interval



| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | balanceAssetsInterval |


### setLastTokenMaturityTimestamp

```solidity
function setLastTokenMaturityTimestamp(uint256 _lastTimestamp) public
```

used by contract owner or the contract itself to set the last time the token maturity function was invoked.

_modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _lastTimestamp | uint256 | last time the token maturity check was performed |



### getLastTokenMaturityTimestamp

```solidity
function getLastTokenMaturityTimestamp() public view returns (uint256)
```

gets the timestamp of the last time the token maturity check was performed



| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | lastTokenMaturityTimestamp |


### setLastBalanceAssetsTimestamp

```solidity
function setLastBalanceAssetsTimestamp(uint256 _lastTimestamp) public
```

used by contract owner or the contract itself to set the last time the balance assets function was invoked.

_modifier onlyOwner can only be called by the contract itself or the contract owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _lastTimestamp | uint256 | last time the balance assets function was performed |



### getLastBalanceAssetsTimestamp

```solidity
function getLastBalanceAssetsTimestamp() public view returns (uint256)
```

gets the timestamp of the last time the balance assets function was performed



| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | lastBalanceAssetsTimestamp |


### isIntervalComplete

```solidity
function isIntervalComplete(uint256 timestamp, uint256 lastTimestamp, uint256 interval) private pure returns (bool)
```

checks if given timestamp completes an interval


| Name | Type | Description |
| ---- | ---- | ----------- |
| timestamp | uint256 | timestamp to check against the last execution and interval |
| lastTimestamp | uint256 | the previous timestamp |
| interval | uint256 | desired time between executions |



### checkUpkeep

```solidity
function checkUpkeep(bytes) external view returns (bool needed, bytes performData)
```

call made from Chainlink Keeper network to see if upkeep needs to be performed based on the current
timestamp and function intervals.





### performUpkeep

```solidity
function performUpkeep(bytes) external
```

call made from Chainlink Keeper network to perform upkeep. If intervals are complete, checks to token
maturity and balancing of assets will be performed.






