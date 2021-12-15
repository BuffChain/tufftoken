// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.0;

import { Context } from "@openzeppelin/contracts-v6/utils/Context.sol";
import { LendingPool } from "@aave/protocol-v2/contracts/protocol/lendingpool/LendingPool.sol";
import { LendingPoolAddressesProvider } from "@aave/protocol-v2/contracts/protocol/configuration/LendingPoolAddressesProvider.sol";
import { IERC20 } from "@openzeppelin/contracts-v6/token/ERC20/IERC20.sol";

import { AaveLPManagerLib } from "./AaveLPManagerLib.sol";

contract AaveLPManager is Context {
    modifier aaveInitLock() {
        require(isAaveInit(), 'Tuff.AaveLPManager: UNINITIALIZED');
        _;
    }

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initAaveLPManager() public {
        require(!isAaveInit(), 'Tuff.AaveLPManager: ALREADY_INITIALIZED');

        AaveLPManagerLib.AaveLPManagerStruct storage ss = AaveLPManagerLib.aaveLPManagerStorage();

        //Aave ABI Contract addresses https://docs.aave.com/developers/deployed-contracts/deployed-contracts
        ss.lpProviderAddr = address(0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5);
        ss.supportedTokens.push(address(0x6B175474E89094C44Da98b954EedeAC495271d0F)); //DAI

        ss.isInit = true;
    }

    function isAaveInit() public view returns (bool) {
        AaveLPManagerLib.AaveLPManagerStruct storage ss = AaveLPManagerLib.aaveLPManagerStorage();
        return ss.isInit;
    }

    function getAaveLPAddr() public view aaveInitLock returns (address) {
        AaveLPManagerLib.AaveLPManagerStruct storage ss = AaveLPManagerLib.aaveLPManagerStorage();
        return LendingPoolAddressesProvider(ss.lpProviderAddr).getLendingPool();
    }

    //TODO: Need to make sure this is locked down to only owner and approved callers (eg chainlink)
    function depositToAave(address erc20TokenAddr, uint256 amount) public aaveInitLock {
        AaveLPManagerLib.AaveLPManagerStruct storage ss = AaveLPManagerLib.aaveLPManagerStorage();

        //TODO: Make address to bool mapping
        bool _isSupportedToken = false;
        for (uint256 i = 0; i < ss.supportedTokens.length; i++) {
            if (ss.supportedTokens[i] == erc20TokenAddr) {
                _isSupportedToken = true;
                break;
            }
        }
        require(_isSupportedToken, "TUFF: AaveLPManager: This token is not currently supported");

        IERC20(erc20TokenAddr).approve(getAaveLPAddr(), amount);
        LendingPool(getAaveLPAddr()).deposit(erc20TokenAddr, amount, address(this), 0);
    }
}
