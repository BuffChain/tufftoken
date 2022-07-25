// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.7.0;

/// @notice TuffOwner interface used for cross solidity versions (v7 - v8)
interface ITuffOwnerV7 {
    function requireOnlyOwner(address sender) external view;
}
