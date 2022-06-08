# Solidity API

## AaveLPManager

### onlyOwner

```solidity
modifier onlyOwner()
```

### aaveInitLock

```solidity
modifier aaveInitLock()
```

### initAaveLPManager

```solidity
function initAaveLPManager(address _lendingPoolProviderAddr, address _protocolDataProviderAddr, address _wethAddr) public
```

### isAaveInit

```solidity
function isAaveInit() public view returns (bool)
```

### getAaveLPAddr

```solidity
function getAaveLPAddr() public view returns (address)
```

### getProtocolDataProviderAddr

```solidity
function getProtocolDataProviderAddr() public view returns (address)
```

### depositToAave

```solidity
function depositToAave(address erc20TokenAddr, uint256 amount) public
```

### isAaveSupportedToken

```solidity
function isAaveSupportedToken(address tokenAddr) public view returns (bool, uint256)
```

### addAaveSupportedToken

```solidity
function addAaveSupportedToken(address tokenAddr, uint256 targetPercentage) public
```

### removeAaveSupportedToken

```solidity
function removeAaveSupportedToken(address tokenAddr) public
```

### getAllAaveSupportedTokens

```solidity
function getAllAaveSupportedTokens() public view returns (address[])
```

### setAaveTokenTargetedPercentage

```solidity
function setAaveTokenTargetedPercentage(address tokenAddr, uint256 targetPercentage) public
```

### getAaveTokenTargetedPercentage

```solidity
function getAaveTokenTargetedPercentage(address tokenAddr) public view returns (uint256)
```

### getAaveTotalTargetWeight

```solidity
function getAaveTotalTargetWeight() public view returns (uint256)
```

### getAaveIncome

```solidity
function getAaveIncome(address tokenAddr) public view returns (uint256)
```

### liquidateAaveTreasury

```solidity
function liquidateAaveTreasury() public returns (bool)
```

### withdrawFromAave

```solidity
function withdrawFromAave(address erc20TokenAddr, uint256 amount) public returns (uint256)
```

### withdrawAllFromAave

```solidity
function withdrawAllFromAave(address asset) public
```

### getATokenBalance

```solidity
function getATokenBalance(address asset) public view returns (uint256)
```

### getATokenAddress

```solidity
function getATokenAddress(address asset) public view returns (address)
```

### balanceAaveLendingPool

```solidity
function balanceAaveLendingPool() public
```

