// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.0;

import { Context } from "@openzeppelin/contracts-v6/utils/Context.sol";
import { LendingPool } from "@aave/protocol-v2/contracts/protocol/lendingpool/LendingPool.sol";
import { LendingPoolAddressesProvider } from "@aave/protocol-v2/contracts/protocol/configuration/LendingPoolAddressesProvider.sol";
import { IERC20 } from "@openzeppelin/contracts-v6/token/ERC20/IERC20.sol";


contract AaveLPManager is Context {
    uint256 private _initialized = 0;

    modifier initializerLock() {
        require(isAaveInitialized() == 1, 'TUFF: AaveLPManager: UNINITIALIZED');
        _;
    }

    //TODO: Create governance around this
    address[] private _supportedTokens;

    //
    // Aave ABI Contract addresses https://docs.aave.com/developers/deployed-contracts/deployed-contracts
    //
    //TODO: Create governance around this
    address private _lpProviderAddr;
    address private _lpAddr;

    //Basically a constructor, but since the diamond standard doesn't support constructors we imitate it with a
    // one-time only function. This is called immediately after deployment
    function initAaveLPManager() public {
        _lpProviderAddr = address(0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5);
        _supportedTokens.push(address(0x6B175474E89094C44Da98b954EedeAC495271d0F)); //DAI
        _initialized = 1;
    }

    function isAaveInitialized() public view returns (uint256) {
        return _initialized;
    }

    function getAaveLPAddr() public view initializerLock returns (address) {
        return LendingPoolAddressesProvider(_lpProviderAddr).getLendingPool();
    }

    function depositToAave(address erc20Token, uint256 amount, address onBehalfOf) public payable initializerLock {
        //TODO: Make address to bool mapping
        bool _isSupportedToken = false;
        for (uint256 i = 0; i < _supportedTokens.length; i++) {
            if (_supportedTokens[i] == erc20Token) {
                _isSupportedToken = true;
                break;
            }
        }
        require(_isSupportedToken, "TUFF: This token is not currently supported");

        LendingPool(getAaveLPAddr()).deposit(erc20Token, amount, onBehalfOf, 0);
    }

    receive() external payable initializerLock {}
}
