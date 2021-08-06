// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.0;

import {ILendingPool} from "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";

import "./ILockable.sol";

contract AaveLPManager is ILockable {
//    // TODO: Move this to ILiquidityPool
//    address private _owner;
//    uint32 private _totalBorrowed;
//    uint256 private _unlocked = 1;
//
//    //
//    // Aave ABI Contract addresses https://docs.aave.com/developers/deployed-contracts/deployed-contracts
//    //
//    // TODO: This address should have governance around this (for upgrades and for transparency)
//    address private _aaveLendingPoolContract = address(0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9);
//
//    event OwnershipTransferred(
//        address indexed previousOwner,
//        address indexed newOwner
//    );
//
//    constructor() internal {
//        _owner = _msgSender();
//        emit OwnershipTransferred(address(0), _owner);
//    }

    //
    // LP
    //
//    function stake(uint32 _loanId) internal lock {
//        // abi calls to specific LPs
//        // aave, comp, curve, makerdao, etc
//        _pool = ILendingPool.getAddressesProvider().getLendingPool();
//        ILendingPool(_pool).deposit(token, amount, user, '0');
//    }
}
