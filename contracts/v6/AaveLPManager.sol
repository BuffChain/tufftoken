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
    address[] private _supportedTokens;

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

        _supportedTokens.push(address(0x6B175474E89094C44Da98b954EedeAC495271d0F)); //DAI
    }

    function getLPAddr() public view onlyOwner returns (address) {
        return _lpAddr;
    }

    function deposit(address token, uint256 amount, address onBehalfOf) public lock {
        bool _isSupportedToken = false;
        for (uint256 i = 0; i < _supportedTokens.length; i++) {
            if (_supportedTokens[i] == token) {
                _isSupportedToken = true;
                break;
            }
        }
        require(_isSupportedToken, "TUFF: This token is not currently supported");

        //TODO: Add referral account, currently 0
        LendingPool(_lpAddr).deposit(token, amount, onBehalfOf, 0);
    }

    receive() external payable {}
}
