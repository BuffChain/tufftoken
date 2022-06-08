# Solidity API

## AaveLPManagerLib

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
  uint256 totalTargetWeight;
}
```

### TokenMetadata

```solidity
struct TokenMetadata {
  uint256 targetPercent;
  uint256 actualPercent;
  address aToken;
}
```

### getState

```solidity
function getState() internal pure returns (struct AaveLPManagerLib.StateStorage stateStorage)
```

