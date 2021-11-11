// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import { console } from "hardhat/console.sol";

contract DiamondBase {

    bool private _isInitialized = false;

    modifier initializerLock() {
        require(isInitialized() == true, 'TUFF: Base: UNINITIALIZED');
        _;
    }

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initBase() public {
        console.log("Base starting initialization [%s]", isInitialized());
        _isInitialized = true;
        console.log("Base completed initialization [%s]", isInitialized());
    }

    function isInitialized() public view returns (bool) {
        return _isInitialized;
    }

    receive() external payable {}
}
