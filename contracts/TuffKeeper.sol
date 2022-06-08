// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;
pragma abicoder v2;

import {TuffKeeperLib} from "./TuffKeeperLib.sol";
import {KeeperCompatibleInterface} from "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {TokenMaturity} from "./TokenMaturity.sol";
import {IAaveLPManager} from "./IAaveLPManager.sol";
import "./TuffOwner.sol";

contract TuffKeeper is KeeperCompatibleInterface {
    modifier onlyOwner() {
        TuffOwner(address(this)).requireOnlyOwner(msg.sender);
        _;
    }

    modifier initTuffKeeperLock() {
        require(
            isTuffKeeperInit(),
            string(
                abi.encodePacked(TuffKeeperLib.NAMESPACE, ": ", "UNINITIALIZED")
            )
        );
        _;
    }

    function isTuffKeeperInit() public view returns (bool) {
        TuffKeeperLib.StateStorage storage ss = TuffKeeperLib.getState();
        return ss.isInit;
    }

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initTuffKeeper() public onlyOwner {
        require(
            !isTuffKeeperInit(),
            string(
                abi.encodePacked(
                    TuffKeeperLib.NAMESPACE,
                    ": ",
                    "ALREADY_INITIALIZED"
                )
            )
        );

        TuffKeeperLib.StateStorage storage ss = TuffKeeperLib.getState();

        ss.tokenMaturityInterval = 86400; // 1 day
        ss.balanceAssetsInterval = 86400 * 7; // 1 week
        ss.lastTokenMaturityTimestamp = block.timestamp;
        ss.lastBalanceAssetsTimestamp = block.timestamp;

        ss.isInit = true;
    }

    function setTokenMaturityInterval(uint256 _tokenMaturityInterval)
        public
        initTuffKeeperLock
        onlyOwner
    {
        TuffKeeperLib.StateStorage storage ss = TuffKeeperLib.getState();
        ss.tokenMaturityInterval = _tokenMaturityInterval;
    }

    function getTokenMaturityInterval() public view returns (uint256) {
        TuffKeeperLib.StateStorage storage ss = TuffKeeperLib.getState();
        return ss.tokenMaturityInterval;
    }

    function setBalanceAssetsInterval(uint256 _balanceAssetsInterval)
        public
        initTuffKeeperLock
        onlyOwner
    {
        TuffKeeperLib.StateStorage storage ss = TuffKeeperLib.getState();
        ss.balanceAssetsInterval = _balanceAssetsInterval;
    }

    function getBalanceAssetsInterval() public view returns (uint256) {
        TuffKeeperLib.StateStorage storage ss = TuffKeeperLib.getState();
        return ss.balanceAssetsInterval;
    }

    function setLastTokenMaturityTimestamp(uint256 _lastTimestamp)
        public
        initTuffKeeperLock
        onlyOwner
    {
        TuffKeeperLib.StateStorage storage ss = TuffKeeperLib.getState();
        ss.lastTokenMaturityTimestamp = _lastTimestamp;
    }

    function getLastTokenMaturityTimestamp() public view returns (uint256) {
        TuffKeeperLib.StateStorage storage ss = TuffKeeperLib.getState();
        return ss.lastTokenMaturityTimestamp;
    }

    function setLastBalanceAssetsTimestamp(uint256 _lastTimestamp)
        public
        initTuffKeeperLock
        onlyOwner
    {
        TuffKeeperLib.StateStorage storage ss = TuffKeeperLib.getState();
        ss.lastBalanceAssetsTimestamp = _lastTimestamp;
    }

    function getLastBalanceAssetsTimestamp() public view returns (uint256) {
        TuffKeeperLib.StateStorage storage ss = TuffKeeperLib.getState();
        return ss.lastBalanceAssetsTimestamp;
    }

    function isIntervalComplete(
        uint256 timestamp,
        uint256 lastTimestamp,
        uint256 interval
    ) private view initTuffKeeperLock returns (bool) {
        return (timestamp - lastTimestamp) >= interval;
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        initTuffKeeperLock
        returns (bool needed, bytes memory performData)
    {
        needed =
            isIntervalComplete(
                block.timestamp,
                getLastTokenMaturityTimestamp(),
                getTokenMaturityInterval()
            ) ||
            isIntervalComplete(
                block.timestamp,
                getLastBalanceAssetsTimestamp(),
                getBalanceAssetsInterval()
            );
        performData = bytes(Strings.toString(block.timestamp));
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override initTuffKeeperLock {
        TokenMaturity tokenMaturity = TokenMaturity(address(this));

        if (
            isIntervalComplete(
                block.timestamp,
                getLastTokenMaturityTimestamp(),
                getTokenMaturityInterval()
            )
        ) {
            if (tokenMaturity.isTokenMatured(block.timestamp)) {
                tokenMaturity.onTokenMaturity();
            }
            setLastTokenMaturityTimestamp(block.timestamp);
        }

        if (
            isIntervalComplete(
                block.timestamp,
                getLastBalanceAssetsTimestamp(),
                getBalanceAssetsInterval()
            ) && !tokenMaturity.isTokenMatured(block.timestamp)
        ) {
            IAaveLPManager aaveLPManager = IAaveLPManager(address(this));
            aaveLPManager.balanceAaveLendingPool();
            setLastBalanceAssetsTimestamp(block.timestamp);
        }
    }
}
