// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;
pragma abicoder v2;

import {TuffKeeperLib} from "./TuffKeeperLib.sol";
import {KeeperCompatibleInterface} from "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {TokenMaturity} from "./TokenMaturity.sol";
import {IAaveLPManager} from "./IAaveLPManager.sol";
import "./TuffOwner.sol";

/// @notice This contract is responsible for running core functions are specified intervals. These functions track token
/// maturity and keeping a balanced treasury.
/// @dev Implementation of Chainlink Keeper  https://docs.chain.link/docs/chainlink-keepers/introduction/.

/* solhint-disable not-rely-on-time */
contract TuffKeeper is KeeperCompatibleInterface {
    /// @dev functions with the onlyOwner modifier can only be called by the contract itself or the contract owner
    modifier onlyOwner() {
        TuffOwner(address(this)).requireOnlyOwner(msg.sender);
        _;
    }

    function isTuffKeeperInit() public view returns (bool) {
        TuffKeeperLib.StateStorage storage ss = TuffKeeperLib.getState();
        return ss.isInit;
    }

    /// @notice Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    /// constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    /// @dev token maturity interval is set to 1 day and balance treasury interval is set to 1 week
    function initTuffKeeper() public onlyOwner {
        //TuffKeeper Already Initialized
        require(!isTuffKeeperInit(), "TKAI");

        TuffKeeperLib.StateStorage storage ss = TuffKeeperLib.getState();

        ss.tokenMaturityInterval = 86400; // 1 day
        ss.balanceAssetsInterval = 86400 * 7; // 1 week
        ss.lastTokenMaturityTimestamp = block.timestamp;
        ss.lastBalanceAssetsTimestamp = block.timestamp;

        ss.isInit = true;
    }

    /// @notice used by contract owner to set token maturity interval
    /// @dev modifier onlyOwner can only be called by the contract itself or the contract owner
    /// @param _tokenMaturityInterval interval for checking if VBT has matured
    function setTokenMaturityInterval(uint256 _tokenMaturityInterval) public onlyOwner {
        TuffKeeperLib.StateStorage storage ss = TuffKeeperLib.getState();
        ss.tokenMaturityInterval = _tokenMaturityInterval;
    }

    /// @notice gets the token maturity interval
    /// @return tokenMaturityInterval
    function getTokenMaturityInterval() public view returns (uint256) {
        TuffKeeperLib.StateStorage storage ss = TuffKeeperLib.getState();
        return ss.tokenMaturityInterval;
    }

    /// @notice used by contract owner to set balance treasury interval
    /// @dev modifier onlyOwner can only be called by the contract itself or the contract owner
    /// @param _balanceAssetsInterval interval for balancing treasury
    function setBalanceAssetsInterval(uint256 _balanceAssetsInterval) public onlyOwner {
        TuffKeeperLib.StateStorage storage ss = TuffKeeperLib.getState();
        ss.balanceAssetsInterval = _balanceAssetsInterval;
    }

    /// @notice gets the balance assets interval
    /// @return balanceAssetsInterval
    function getBalanceAssetsInterval() public view returns (uint256) {
        TuffKeeperLib.StateStorage storage ss = TuffKeeperLib.getState();
        return ss.balanceAssetsInterval;
    }

    /// @notice used by contract owner or the contract itself to set the last time the token maturity function was invoked.
    /// @dev modifier onlyOwner can only be called by the contract itself or the contract owner
    /// @param _lastTimestamp last time the token maturity check was performed
    function setLastTokenMaturityTimestamp(uint256 _lastTimestamp) public onlyOwner {
        TuffKeeperLib.StateStorage storage ss = TuffKeeperLib.getState();
        ss.lastTokenMaturityTimestamp = _lastTimestamp;
    }

    /// @notice gets the timestamp of the last time the token maturity check was performed
    /// @return lastTokenMaturityTimestamp
    function getLastTokenMaturityTimestamp() public view returns (uint256) {
        TuffKeeperLib.StateStorage storage ss = TuffKeeperLib.getState();
        return ss.lastTokenMaturityTimestamp;
    }

    /// @notice used by contract owner or the contract itself to set the last time the balance assets function was invoked.
    /// @dev modifier onlyOwner can only be called by the contract itself or the contract owner
    /// @param _lastTimestamp last time the balance assets function was performed
    function setLastBalanceAssetsTimestamp(uint256 _lastTimestamp) public onlyOwner {
        TuffKeeperLib.StateStorage storage ss = TuffKeeperLib.getState();
        ss.lastBalanceAssetsTimestamp = _lastTimestamp;
    }

    /// @notice gets the timestamp of the last time the balance assets function was performed
    /// @return lastBalanceAssetsTimestamp
    function getLastBalanceAssetsTimestamp() public view returns (uint256) {
        TuffKeeperLib.StateStorage storage ss = TuffKeeperLib.getState();
        return ss.lastBalanceAssetsTimestamp;
    }

    /// @notice checks if given timestamp completes an interval
    /// @param timestamp timestamp to check against the last execution and interval
    /// @param lastTimestamp the previous timestamp
    /// @param interval desired time between executions
    function isIntervalComplete(
        uint256 timestamp,
        uint256 lastTimestamp,
        uint256 interval
    ) private pure returns (bool) {
        return (timestamp - lastTimestamp) >= interval;
    }

    /// @notice call made from Chainlink Keeper network to see if upkeep needs to be performed based on the current
    /// timestamp and function intervals.
    function checkUpkeep(
        bytes calldata /* checkData */
    ) external view override returns (bool needed, bytes memory performData) {
        needed =
            isIntervalComplete(block.timestamp, getLastTokenMaturityTimestamp(), getTokenMaturityInterval()) ||
            isIntervalComplete(block.timestamp, getLastBalanceAssetsTimestamp(), getBalanceAssetsInterval());
        performData = bytes(Strings.toString(block.timestamp));
    }

    /// @notice call made from Chainlink Keeper network to perform upkeep. If intervals are complete, checks to token
    /// maturity and balancing of assets will be performed.
    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        TokenMaturity tokenMaturity = TokenMaturity(address(this));

        if (isIntervalComplete(block.timestamp, getLastTokenMaturityTimestamp(), getTokenMaturityInterval())) {
            if (tokenMaturity.isTokenMatured(block.timestamp)) {
                tokenMaturity.onTokenMaturity();
            }
            setLastTokenMaturityTimestamp(block.timestamp);
        }

        if (
            isIntervalComplete(block.timestamp, getLastBalanceAssetsTimestamp(), getBalanceAssetsInterval()) &&
            !tokenMaturity.isTokenMatured(block.timestamp)
        ) {
            IAaveLPManager aaveLPManager = IAaveLPManager(address(this));
            aaveLPManager.balanceAaveLendingPool();
            setLastBalanceAssetsTimestamp(block.timestamp);
        }
    }
}
