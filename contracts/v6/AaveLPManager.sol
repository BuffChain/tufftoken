// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.0;

import { Context } from "@openzeppelin/contracts-v6/utils/Context.sol";
import { LendingPool } from "@aave/protocol-v2/contracts/protocol/lendingpool/LendingPool.sol";
import { LendingPoolAddressesProvider } from "@aave/protocol-v2/contracts/protocol/configuration/LendingPoolAddressesProvider.sol";
import { IERC20 } from "@openzeppelin/contracts-v6/token/ERC20/IERC20.sol";

import { AaveLPManagerLib } from "./AaveLPManagerLib.sol";

contract AaveLPManager is Context {
    modifier aaveInitLock() {
        require(isAaveInit(), string(abi.encodePacked(AaveLPManagerLib.NAMESPACE, ": ", "UNINITIALIZED")));
        _;
    }

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initAaveLPManager(address _lendingPoolProviderAddr, address[] memory _supportedTokens) public {
        require(!isAaveInit(), string(abi.encodePacked(AaveLPManagerLib.NAMESPACE, ": ", "ALREADY_INITIALIZED")));

        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();

        ss.lpProviderAddr = _lendingPoolProviderAddr;

        ss.supportedTokensCount = 0;
        for (uint i = 0; i < _supportedTokens.length - 1; i++) {
            addAaveSupportedToken(_supportedTokens[i]);
        }

        ss.isInit = true;
    }

    function isAaveInit() public view returns (bool) {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();
        return ss.isInit;
    }

    function getAaveLPAddr() public view aaveInitLock returns (address) {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();
        return LendingPoolAddressesProvider(ss.lpProviderAddr).getLendingPool();
    }

    //TODO: Need to make sure this is locked down to only owner and approved callers (eg chainlink)
    function depositToAave(address erc20TokenAddr, uint256 amount) public aaveInitLock {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();

        require(isAaveSupportedToken(erc20TokenAddr), string(abi.encodePacked(AaveLPManagerLib.NAMESPACE, ": ", "This token is not currently supported")));

        IERC20(erc20TokenAddr).approve(getAaveLPAddr(), amount);
        LendingPool(getAaveLPAddr()).deposit(erc20TokenAddr, amount, address(this), 0);
    }

    function isAaveSupportedToken(address tokenAddr) public aaveInitLock returns (bool) {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();
        return ss.supportedTokens[tokenAddr];
    }

    function removeAaveSupportedToken(address tokenAddr) public aaveInitLock {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();
        ss.supportedTokens[tokenAddr] = false;
        ss.supportedTokensCount--;
    }

    // initLock is not required as this function is used by the init function
    function addAaveSupportedToken(address tokenAddr) public {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();

        //TODO: Check to make sure the token is an erc20Token
        // (i.e. has approve() function, though balanceOf() is a view and gas free)
        IERC20(tokenAddr).balanceOf(address(this));

        ss.supportedTokens[tokenAddr] = true;
        ss.supportedTokensCount++;
    }

    function getAllAaveSupportedTokens() public aaveInitLock returns (address[] memory) {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();

        address[] memory ret = new address[](ss.supportedTokensCount);
        for (uint i = 0; i < ss.supportedTokensCount; i++) {
            ret[i] = ss.supportedTokens[i];
        }
        return ret;
    }
}
