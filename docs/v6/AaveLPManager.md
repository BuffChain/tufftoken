# Solidity API

## AaveLPManager

### onlyOwner

```solidity
modifier onlyOwner()
```

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

### getBalanceBufferPercent

```solidity
function getBalanceBufferPercent() public view returns (uint24)
```

### setBalanceBufferPercent

```solidity
function setBalanceBufferPercent(uint24 _balanceBufferPercent) public
```

### getAllAaveSupportedTokens

```solidity
function getAllAaveSupportedTokens() public view returns (address[])
```

### setAaveTokenTargetWeight

```solidity
function setAaveTokenTargetWeight(address tokenAddr, uint24 targetWeight) public
```

### getAaveTokenTargetWeight

```solidity
function getAaveTokenTargetWeight(address tokenAddr) public view returns (uint256)
```

### getAaveTokenCurrentPercentage

```solidity
function getAaveTokenCurrentPercentage(address tokenAddr) public view returns (uint256)
```

### getBalanceMetadata

```solidity
function getBalanceMetadata() private view returns (struct AaveLPManager.BalanceMetadata)
```

### getAaveTotalTargetWeight

```solidity
function getAaveTotalTargetWeight() public view returns (uint256)
```

### getAaveIncome

```solidity
function getAaveIncome(address tokenAddr) public view returns (uint256)
```

### getATokenBalance

```solidity
function getATokenBalance(address asset) public view returns (uint256)
```

### getATokenAddress

```solidity
function getATokenAddress(address asset) public view returns (address)
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
function addAaveSupportedToken(address tokenAddr, address chainlinkEthTokenAggrAddr, uint24 targetWeight) public
```

### removeAaveSupportedToken

```solidity
function removeAaveSupportedToken(address tokenAddr) public
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

### AaveLPManagerBalanceSwap

```solidity
event AaveLPManagerBalanceSwap(address tokenSwappedFor, uint256 amountIn, uint256 amountOut)
```

_Emitted when a swap occurs to balance an under-balanced token_

### balanceAaveLendingPool

```solidity
function balanceAaveLendingPool() public
```

