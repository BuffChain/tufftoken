// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.0;

import {Context} from "@openzeppelin/contracts-v6/utils/Context.sol";
import {LendingPool} from "@aave/protocol-v2/contracts/protocol/lendingpool/LendingPool.sol";
import {LendingPoolAddressesProvider} from "@aave/protocol-v2/contracts/protocol/configuration/LendingPoolAddressesProvider.sol";
import {IERC20} from "@openzeppelin/contracts-v6/token/ERC20/IERC20.sol";

import {AaveLPManagerLib} from "./AaveLPManagerLib.sol";

contract AaveLPManager is Context {
    modifier aaveInitLock() {
        require(
            isAaveInit(),
            string(
                abi.encodePacked(
                    AaveLPManagerLib.NAMESPACE,
                    ": ",
                    "UNINITIALIZED"
                )
            )
        );
        _;
    }

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initAaveLPManager(
        address _lendingPoolProviderAddr,
        address[] memory _supportedTokens
    ) public {
        require(
            !isAaveInit(),
            string(
                abi.encodePacked(
                    AaveLPManagerLib.NAMESPACE,
                    ": ",
                    "ALREADY_INITIALIZED"
                )
            )
        );

        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();

        ss.lpProviderAddr = _lendingPoolProviderAddr;
        ss.supportedTokens = _supportedTokens;

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

        //TODO: Make address to bool mapping
        bool _isSupportedToken = isSupportedToken(erc20TokenAddr);
        require(_isSupportedToken, "TUFF: AaveLPManager: This token is not currently supported");

        IERC20(erc20TokenAddr).approve(getAaveLPAddr(), amount);
        LendingPool(getAaveLPAddr()).deposit(erc20TokenAddr, amount, address(this), 0);
    }

    function isSupportedToken(address erc20TokenAddr) public aaveInitLock returns (bool) {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();
        bool _isSupportedToken = false;
        for (uint256 i = 0; i < ss.supportedTokens.length; i++) {
            if (ss.supportedTokens[i] == erc20TokenAddr) {
                _isSupportedToken = true;
                break;
            }
        }
        return _isSupportedToken;
    }

    function withdrawFromAave(address erc20TokenAddr, uint256 amount) public aaveInitLock {

        bool _isSupportedToken = isSupportedToken(erc20TokenAddr);
        require(_isSupportedToken, "TUFF: AaveLPManager: This token is not currently supported");

        LendingPool(getAaveLPAddr()).withdraw(erc20TokenAddr, amount, address(this));
    }


}
