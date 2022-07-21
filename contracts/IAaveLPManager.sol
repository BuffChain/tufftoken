// SPDX-License-Identifier: agpl-3.0

pragma solidity ^0.8.0;

/// @notice AaveLPManager interface used for cross solidity versions (v6 - v8)
interface IAaveLPManager {
    function getAllAaveSupportedTokens() external view returns (address[] memory);

    function liquidateAaveTreasury() external returns (bool);

    function balanceAaveLendingPool() external;
}
