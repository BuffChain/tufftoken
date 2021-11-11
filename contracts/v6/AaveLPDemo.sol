// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.0;

import { Context } from "@openzeppelin/contracts-v6/utils/Context.sol";
import { LendingPool } from "@aave/protocol-v2/contracts/protocol/lendingpool/LendingPool.sol";
import { LendingPoolAddressesProvider } from "@aave/protocol-v2/contracts/protocol/configuration/LendingPoolAddressesProvider.sol";
import { IERC20 } from "@openzeppelin/contracts-v6/token/ERC20/IERC20.sol";

import { console } from "hardhat/console.sol";

contract AaveLPDemo is Context {
    bool private _aaveNeedsInit = true;

    modifier aaveInitLock() {
        require(isAaveDemoInit() == true, 'TUFF: AaveLPDemo: UNINITIALIZED');
        _;
    }

    address[] private _supportedTokens;

    //Aave ABI Contract addresses https://docs.aave.com/developers/deployed-contracts/deployed-contracts
    address private _lpProviderAddr;
    address private _lpAddr;

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initAaveLPDemo() public {
        console.log("AaveDemo: default value is %s", _aaveNeedsInit);
        require(isAaveDemoInit() == false, 'TUFF: AaveLPDemo: ALREADY_INITIALIZED');

        _lpProviderAddr = address(0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5);
        _supportedTokens.push(address(0x6B175474E89094C44Da98b954EedeAC495271d0F)); //DAI

        _aaveNeedsInit = false;
    }

    function isAaveDemoInit() public view returns (bool) {
        return !_aaveNeedsInit;
    }

    function getAaveLPDemoAddr() public view aaveInitLock returns (address) {
        return LendingPoolAddressesProvider(_lpProviderAddr).getLendingPool();
    }

    //TODO: Need to make sure this is locked down to only owner and approved callers (eg chainlink)
    function depositToAaveDemo(address erc20TokenAddr, uint256 amount) public aaveInitLock {
        //TODO: Make address to bool mapping
        bool _isSupportedToken = false;
        for (uint256 i = 0; i < _supportedTokens.length; i++) {
            if (_supportedTokens[i] == erc20TokenAddr) {
                _isSupportedToken = true;
                break;
            }
        }
        require(_isSupportedToken, "TUFF: AaveLPManager: This token is not currently supported");

        IERC20(erc20TokenAddr).approve(getAaveLPDemoAddr(), amount);
        LendingPool(getAaveLPDemoAddr()).deposit(erc20TokenAddr, amount, address(this), 0);
    }
}
