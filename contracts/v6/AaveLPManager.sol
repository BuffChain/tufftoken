// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.0;

import { Ownable } from "@openzeppelin/contracts-v6/access/Ownable.sol";
import { LendingPool } from "@aave/protocol-v2/contracts/protocol/lendingpool/LendingPool.sol";
import { LendingPoolAddressesProvider } from "@aave/protocol-v2/contracts/protocol/configuration/LendingPoolAddressesProvider.sol";
import { IERC20 } from "@openzeppelin/contracts-v6/token/ERC20/IERC20.sol";


import "../ILockable.sol";

contract AaveLPManager is Ownable, ILockable {
    uint256 private _unlocked = 1;

    //TODO: Create governance around this
    address[] private _supportedTokens;

    //
    // Aave ABI Contract addresses https://docs.aave.com/developers/deployed-contracts/deployed-contracts
    //
    //TODO: Create governance around this
    address private _lpProviderAddr;
    address private _lpAddr;

    constructor(address initialOwner) public {
        transferOwnership(initialOwner);

        _lpProviderAddr = address(0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5);

        _supportedTokens.push(address(0x6B175474E89094C44Da98b954EedeAC495271d0F)); //DAI
    }

    function getLPAddr() public view returns (address) {
        return LendingPoolAddressesProvider(_lpProviderAddr).getLendingPool();
    }

    function deposit(address erc20Token, uint256 amount, address onBehalfOf) public payable onlyOwner lock {
        //TODO: Make address to bool mapping
        bool _isSupportedToken = false;
        for (uint256 i = 0; i < _supportedTokens.length; i++) {
            if (_supportedTokens[i] == erc20Token) {
                _isSupportedToken = true;
                break;
            }
        }
        require(_isSupportedToken, "TUFF: This token is not currently supported");

        LendingPool(getLPAddr()).deposit(erc20Token, amount, onBehalfOf, 0);
    }

    receive() external payable {}
}
