// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.7.0;

// solidity v7 interface for TuffOwner so it's callable from our v7 contracts
interface ITuffOwnerV7 {
    function requireOnlyOwner() external view;
}
