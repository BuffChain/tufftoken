# Solidity API

## TuffKeeper


This contract is responsible for running core functions are specified intervals. These functions track token
maturity and keeping a balanced treasury.

_Implementation of Chainlink Keeper  https://docs.chain.link/docs/chainlink-keepers/introduction/._




### onlyOwner

```solidity
modifier onlyOwner()
```







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





### getTokenMaturityInterval

```solidity
function getTokenMaturityInterval() public view returns (uint256)
```







### setBalanceAssetsInterval

```solidity
function setBalanceAssetsInterval(uint256 _balanceAssetsInterval) public
```

used by contract owner to set balance treasury interval





### getBalanceAssetsInterval

```solidity
function getBalanceAssetsInterval() public view returns (uint256)
```







### setLastTokenMaturityTimestamp

```solidity
function setLastTokenMaturityTimestamp(uint256 _lastTimestamp) public
```

used by contract owner or the contract itself to set the last time the token maturity function was invoked.





### getLastTokenMaturityTimestamp

```solidity
function getLastTokenMaturityTimestamp() public view returns (uint256)
```







### setLastBalanceAssetsTimestamp

```solidity
function setLastBalanceAssetsTimestamp(uint256 _lastTimestamp) public
```

used by contract owner or the contract itself to set the last time the balance assets function was invoked.





### getLastBalanceAssetsTimestamp

```solidity
function getLastBalanceAssetsTimestamp() public view returns (uint256)
```







### isIntervalComplete

```solidity
function isIntervalComplete(uint256 timestamp, uint256 lastTimestamp, uint256 interval) private pure returns (bool)
```

checks if given timestamp completes an interval





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

call made from Chainlink Keeper network to perform upkeep when checkUpkeep says so.






