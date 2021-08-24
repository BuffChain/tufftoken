// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.0;

import "@openzeppelin/contracts-v6/access/Ownable.sol";
import {ILendingPool} from "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";

import "../ILockable.sol";

contract AaveLPManager is Ownable, ILockable {
    address private _owner;
    uint256 private _unlocked = 1;

    constructor() public {
        _owner = _msgSender();
        emit OwnershipTransferred(address(0), _owner);
    }
}
