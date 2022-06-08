# Solidity API

## TuffKeeper

### onlyOwner

```solidity
modifier onlyOwner()
```

### initTuffKeeperLock

```solidity
modifier initTuffKeeperLock()
```

### isTuffKeeperInit

```solidity
function isTuffKeeperInit() public view returns (bool)
```

### initTuffKeeper

```solidity
function initTuffKeeper() public
```

### setTokenMaturityInterval

```solidity
function setTokenMaturityInterval(uint256 _tokenMaturityInterval) public
```

### getTokenMaturityInterval

```solidity
function getTokenMaturityInterval() public view returns (uint256)
```

### setBalanceAssetsInterval

```solidity
function setBalanceAssetsInterval(uint256 _balanceAssetsInterval) public
```

### getBalanceAssetsInterval

```solidity
function getBalanceAssetsInterval() public view returns (uint256)
```

### setLastTokenMaturityTimestamp

```solidity
function setLastTokenMaturityTimestamp(uint256 _lastTimestamp) public
```

### getLastTokenMaturityTimestamp

```solidity
function getLastTokenMaturityTimestamp() public view returns (uint256)
```

### setLastBalanceAssetsTimestamp

```solidity
function setLastBalanceAssetsTimestamp(uint256 _lastTimestamp) public
```

### getLastBalanceAssetsTimestamp

```solidity
function getLastBalanceAssetsTimestamp() public view returns (uint256)
```

### isIntervalComplete

```solidity
function isIntervalComplete(uint256 timestamp, uint256 lastTimestamp, uint256 interval) private view returns (bool)
```

### checkUpkeep

```solidity
function checkUpkeep(bytes) external view returns (bool needed, bytes performData)
```

### performUpkeep

```solidity
function performUpkeep(bytes) external
```

