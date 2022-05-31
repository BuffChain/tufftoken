// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.0;

// solidity v6 interface for TuffOwner so it's callable from our v6 contracts
interface ITuffOwnerV6 {
    function requireOnlyOwner(address sender) external view;
}
