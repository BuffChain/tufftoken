# Solidity API

## TokenMaturity

### onlyOwner

```solidity
modifier onlyOwner()
```

### initTokenMaturity

```solidity
function initTokenMaturity(uint256 daysUntilMaturity) public
```

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

### setContractMaturityTimestamp

```solidity
function setContractMaturityTimestamp(uint256 timestamp) public
```

### isTokenMatured

```solidity
function isTokenMatured(uint256 timestamp) public view returns (bool)
```

### totalSupplyForRedemption

```solidity
function totalSupplyForRedemption() public view returns (uint256)
```

### setTotalSupplyForRedemption

```solidity
function setTotalSupplyForRedemption(uint256 _totalSupplyForRedemption) public
```

### getContractStartingEthBalance

```solidity
function getContractStartingEthBalance() public view returns (uint256)
```

### setContractStartingEthBalance

```solidity
function setContractStartingEthBalance(uint256 startingEthBalance) public
```

### getRedemptionAmount

```solidity
function getRedemptionAmount(uint256 ownerBalance) public view returns (uint256)
```

### getIsTreasuryLiquidated

```solidity
function getIsTreasuryLiquidated() public view returns (bool)
```

### setIsTreasuryLiquidated

```solidity
function setIsTreasuryLiquidated(bool _isTreasuryLiquidated) public
```

### redeem

```solidity
function redeem() public
```

### hasRedeemed

```solidity
function hasRedeemed(address account) public view returns (bool, uint256)
```

### balanceOfEth

```solidity
function balanceOfEth(address account) public view returns (uint256)
```

### getCurrentContractEthBalance

```solidity
function getCurrentContractEthBalance() public view returns (uint256)
```

### onTokenMaturity

```solidity
function onTokenMaturity() public
```

### liquidateTreasury

```solidity
function liquidateTreasury() public
```

### swapForWETH

```solidity
function swapForWETH(address token, uint256 amount) public returns (uint256)
```

### unwrapWETH

```solidity
function unwrapWETH() public returns (uint256)
```

