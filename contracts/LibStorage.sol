// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

struct TuffVBTStorage {
    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowances;
    mapping(address => bool) isExcludedFromFee;
    string name;
    string symbol;
    uint8 decimals;
    uint256 farmFee;
    uint256 devFee;
    address devWalletAddress;
    uint256 totalSupply;
}

/**
 * https://medium.com/1milliondevs/new-storage-layout-for-proxy-contracts-and-diamonds-98d01d0eadb#bfc1
 */
library LibStorage {
    bytes32 constant TUFFVBT_POSITION = keccak256("io.BuffChain.TuffToken.TuffVBTLib.1");

    function getTuffVBTStorage() internal pure returns (TuffVBTStorage storage s) {
        bytes32 position = TUFFVBT_POSITION;
        assembly {
            s.slot := position
        }
    }
}

contract WithStorage {
    function initialize(
        address initialOwner,
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 farmFee,
        uint256 devFee,
        address devWalletAddress,
        uint256 totalSupply
    ) public {
        TuffVBTStorage storage tVBTStorage = tuffVBTStorage();

        tVBTStorage.name = name;
        tVBTStorage.symbol = symbol;
        tVBTStorage.decimals = decimals;
        tVBTStorage.farmFee = farmFee;
        tVBTStorage.devFee = devFee;
        tVBTStorage.devWalletAddress = devWalletAddress;
        tVBTStorage.totalSupply = totalSupply * 10 ** tVBTStorage.decimals;

        //Set owner balancer and exclude from fees
        tVBTStorage.balances[initialOwner] = tVBTStorage.totalSupply;
        tVBTStorage.isExcludedFromFee[initialOwner] = true;
    }

    function tuffVBTStorage() internal pure returns (TuffVBTStorage storage) {
        return LibStorage.getTuffVBTStorage();
    }
}
