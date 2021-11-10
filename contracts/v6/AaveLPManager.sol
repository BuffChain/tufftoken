// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.0;

import { Context } from "@openzeppelin/contracts-v6/utils/Context.sol";
import { LendingPool } from "@aave/protocol-v2/contracts/protocol/lendingpool/LendingPool.sol";
import { LendingPoolAddressesProvider } from "@aave/protocol-v2/contracts/protocol/configuration/LendingPoolAddressesProvider.sol";
import { IERC20 } from "@openzeppelin/contracts-v6/token/ERC20/IERC20.sol";


contract AaveLPManager is Context {
    bool private _isAaveInitialized = false;

    modifier aaveLPManagerInitializerLock() {
        require(isAaveInitialized() == true, 'TUFF: AaveLPManager: UNINITIALIZED');
        _;
    }

    address[] private _supportedTokens;

    //Aave ABI Contract addresses https://docs.aave.com/developers/deployed-contracts/deployed-contracts
    address private _lpProviderAddr;
    address private _lpAddr;

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initAaveLPManager() public {
        require(_isAaveInitialized == false, 'TUFF: AaveLPManager: ALREADY_INITIALIZED');

        _lpProviderAddr = address(0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5);
        _supportedTokens.push(address(0x6B175474E89094C44Da98b954EedeAC495271d0F)); //DAI

        _isAaveInitialized = true;
    }

    function isAaveInitialized() public view returns (bool) {
        return _isAaveInitialized;
    }

    function getAaveLPAddr() public view aaveLPManagerInitializerLock returns (address) {
        return LendingPoolAddressesProvider(_lpProviderAddr).getLendingPool();
    }

    //TODO: Need to make sure this is locked down to only owner and approved callers (eg chainlink)
    function depositToAave(address erc20TokenAddr, uint256 amount) public aaveLPManagerInitializerLock {
        //TODO: Make address to bool mapping
        bool _isSupportedToken = false;
        for (uint256 i = 0; i < _supportedTokens.length; i++) {
            if (_supportedTokens[i] == erc20TokenAddr) {
                _isSupportedToken = true;
                break;
            }
        }
        require(_isSupportedToken, "TUFF: AaveLPManager: This token is not currently supported");

        IERC20(erc20TokenAddr).approve(getAaveLPAddr(), amount);
        LendingPool(getAaveLPAddr()).deposit(erc20TokenAddr, amount, address(this), 0);
    }
}
