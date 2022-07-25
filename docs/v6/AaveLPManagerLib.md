# Solidity API

## AaveLPManagerLib


storage lib for the AaveLPManager contract.





### NAMESPACE

```solidity
string NAMESPACE
```







### POSITION

```solidity
bytes32 POSITION
```







### StateStorage








```solidity
struct StateStorage {
  bool isInit;
  address[] supportedTokens;
  mapping(address &#x3D;&gt; struct AaveLPManagerLib.TokenMetadata) tokenMetadata;
  address lpProviderAddr;
  address protocolDataProviderAddr;
  address wethAddr;
  uint24 balanceBufferPercent;
  uint256 totalTargetWeight;
  uint24 decimalPrecision;
}
```

### TokenMetadata








```solidity
struct TokenMetadata {
  address chainlinkEthTokenAggrAddr;
  uint256 targetWeight;
}
```

### getState

```solidity
function getState() internal pure returns (struct AaveLPManagerLib.StateStorage stateStorage)
```








