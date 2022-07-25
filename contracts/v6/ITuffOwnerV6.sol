// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.0;

/// @notice TuffOwner interface used for cross solidity versions (v6 - v8)
interface ITuffOwnerV6 {
    function requireOnlyOwner(address sender) external view;
}
