// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import { TuffTokenLib } from  "./TuffTokenLib.sol";

contract TuffToken is Context {
    modifier tuffTokenInitializerLock() {
        require(isTuffTokenInitialized(), 'TUFF: UNINITIALIZED');
        _;
    }

    using SafeMath for uint256;
    using Address for address;

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initTuffToken(address initialOwner) public {
        require(!isTuffTokenInitialized(), 'TUFF: ALREADY_INITIALIZED');

        TuffTokenLib.TuffTokenStruct storage ss = TuffTokenLib.tuffTokenStorage();

        ss.name = "TuffToken";
        ss.symbol = "TUFF";
        ss.decimals = 9;
        ss.farmFee = 10;
        ss.totalSupply = 1000000000 * 10 ** ss.decimals;

        ss.isInit = true;
    }

    function isTuffTokenInitialized() public view returns (bool) {
        TuffTokenLib.TuffTokenStruct storage ss = TuffTokenLib.tuffTokenStorage();
        return ss.isInit;
    }
}
