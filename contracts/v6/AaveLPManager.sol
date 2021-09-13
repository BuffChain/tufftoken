// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.0;

import "@openzeppelin/contracts-v6/access/Ownable.sol";
//import {ILendingPool} from "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";
import {LendingPool} from "@aave/protocol-v2/contracts/protocol/lendingpool/LendingPool.sol";
import {LendingPoolAddressesProvider} from "@aave/protocol-v2/contracts/protocol/configuration/LendingPoolAddressesProvider.sol";
import {LendingPoolAddressesProviderRegistry} from "@aave/protocol-v2/contracts/protocol/configuration/LendingPoolAddressesProviderRegistry.sol";

import "../ILockable.sol";

contract AaveLPManager is Ownable, ILockable {
    address private _owner;
    uint256 private _unlocked = 1;

    //TODO: Create governance around this
    address[] private _acceptedTokens;

    uint256 _aTokenHolding;

    //
    // Aave ABI Contract addresses https://docs.aave.com/developers/deployed-contracts/deployed-contracts
    //
    //TODO: Create governance around this
    address private _lpProviderAddr;
    address private _lpAddr;

    constructor() public {
        //The owner is always the FarmTreasury
        _owner = _msgSender();
        emit OwnershipTransferred(address(0), _owner);

        _lpProviderAddr = address(0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5);
        _lpAddr = LendingPoolAddressesProvider(_lpProviderAddr).getLendingPool();

        _acceptedTokens.push(address(0x6B175474E89094C44Da98b954EedeAC495271d0F)); //DAI
    }

    function getLPAddr() public view onlyOwner returns (address) {
        return _lpAddr;
    }

    function deposit(address token, address onBehalfOf, uint256 amount) public lock {
        bool _isAcceptedToken = false;
        for (uint256 i = 0; i < _acceptedTokens.length; i++) {
            if (_acceptedTokens[i] == token) {
                _isAcceptedToken = true;
                break;
            }
        }
//        require(_isAcceptedToken, "TUFF: Invalid token, cannot deposit into Aave");

        LendingPool(_lpAddr).deposit(token, amount, onBehalfOf, 0);
    }
}
