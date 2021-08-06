// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.5.0;

contract ILockable {

    uint256 private _unlocked = 1;

    modifier lock() {
        require(_unlocked == 1, 'BUFF: LOCKED');
        _unlocked = 0;
        _;
        _unlocked = 1;
    }
}
