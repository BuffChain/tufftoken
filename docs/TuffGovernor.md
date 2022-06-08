# Solidity API

## TuffGovernor

Implementation of openzepplin governance https://docs.openzeppelin.com/contracts/4.x/governance#governor

### _votingDelay

```solidity
uint256 _votingDelay
```

### _votingPeriod

```solidity
uint256 _votingPeriod
```

### _proposalThreshold

```solidity
uint256 _proposalThreshold
```

### constructor

```solidity
constructor(contract ERC20Votes _token, contract TimelockController _timelock) public
```

### votingDelay

```solidity
function votingDelay() public view returns (uint256)
```

module:user-config

_Delay, in number of block, between the proposal is created and the vote starts. This can be increassed to
leave time for users to buy voting power, of delegate it, before the voting of a proposal starts._

### setVotingDelay

```solidity
function setVotingDelay(uint256 delay) public
```

### votingPeriod

```solidity
function votingPeriod() public view returns (uint256)
```

module:user-config

_Delay, in number of blocks, between the vote start and vote ends.

NOTE: The {votingDelay} can delay the start of the vote. This must be considered when setting the voting
duration compared to the voting delay._

### setVotingPeriod

```solidity
function setVotingPeriod(uint256 period) public
```

### proposalThreshold

```solidity
function proposalThreshold() public view returns (uint256)
```

_Part of the Governor Bravo's interface: _"The number of votes required in order for a voter to become a proposer"_._

### setProposalThreshold

```solidity
function setProposalThreshold(uint256 threshold) public
```

### quorum

```solidity
function quorum(uint256 blockNumber) public view returns (uint256)
```

### getVotes

```solidity
function getVotes(address account, uint256 blockNumber) public view returns (uint256)
```

### state

```solidity
function state(uint256 proposalId) public view returns (enum IGovernor.ProposalState)
```

### propose

```solidity
function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) public returns (uint256)
```

### _execute

```solidity
function _execute(uint256 proposalId, address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) internal
```

### _cancel

```solidity
function _cancel(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) internal returns (uint256)
```

### _executor

```solidity
function _executor() internal view returns (address)
```

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view returns (bool)
```

### doPropose

```solidity
function doPropose(address[] targets, uint256[] values, bytes[] calldatas, string description) public returns (uint256)
```

### doQueue

```solidity
function doQueue(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) public returns (uint256)
```

### doExecute

```solidity
function doExecute(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) public payable returns (uint256)
```

