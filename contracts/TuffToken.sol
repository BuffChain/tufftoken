// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import { console } from "hardhat/console.sol";

contract TuffToken is Context {
    bool private _needsInitialization = false;

    modifier tuffTokenInitializerLock() {
        require(isTuffTokenInitialized() == true, 'TUFF: UNINITIALIZED');
        _;
    }

    using SafeMath for uint256;
    using Address for address;

    mapping (address => uint256) private balances;
    mapping (address => mapping (address => uint256)) private _allowances;
    mapping (address => bool) private _isExcludedFromFee;

    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public farmFee;
    uint256 private _totalSupply;

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initTuffToken(address initialOwner) public {
        console.log("TuffToken starting initialization [%s]", isTuffTokenInitialized());
        require(isTuffTokenInitialized() == false, 'TUFF: ALREADY_INITIALIZED');

        name = "TuffToken";
        symbol = "TUFF";
        decimals = 9;
        farmFee = 10;
        _totalSupply = 1000000000 * 10 ** decimals;

        _needsInitialization = false;
        console.log("TuffToken completed initialization [%s]", isTuffTokenInitialized());
    }

    function isTuffTokenInitialized() public view returns (bool) {
        return !_needsInitialization;
    }
}
