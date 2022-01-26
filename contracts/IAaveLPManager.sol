// SPDX-License-Identifier: agpl-3.0

pragma solidity ^0.8.0;

interface IAaveLPManager {
    function getAllAaveSupportedTokens()
        external
        view
        returns (address[] memory);

    function liquidateAaveTreasury() external;
}
