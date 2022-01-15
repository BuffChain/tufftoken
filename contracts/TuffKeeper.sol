// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;
pragma abicoder v2;

import {TuffKeeperLib} from "./TuffKeeperLib.sol";
import {KeeperCompatibleInterface} from "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract TuffKeeper is KeeperCompatibleInterface {
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
    function initTuffKeeper() public {
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

        ss.interval = 86400; // starts at 1 day
        ss.lastTimeStamp = block.timestamp;

        ss.isInit = true;
    }

    function setInterval(uint256 _interval) public initTuffKeeperLock {
        TuffKeeperLib.StateStorage storage ss = TuffKeeperLib.getState();
        ss.interval = _interval;
    }

    function getInterval() public view returns (uint256) {
        TuffKeeperLib.StateStorage storage ss = TuffKeeperLib.getState();
        return ss.interval;
    }

    function setLastTimestamp(uint256 _lastTimeStamp)
        public
        initTuffKeeperLock
    {
        TuffKeeperLib.StateStorage storage ss = TuffKeeperLib.getState();
        ss.lastTimeStamp = _lastTimeStamp;
    }

    function getLastTimestamp() public view returns (uint256) {
        TuffKeeperLib.StateStorage storage ss = TuffKeeperLib.getState();
        return ss.lastTimeStamp;
    }

    function isIntervalComplete(uint256 timestamp)
        private
        view
        initTuffKeeperLock
        returns (bool)
    {
        return (timestamp - getLastTimestamp()) >= getInterval();
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
        needed = isIntervalComplete(block.timestamp);
        performData = bytes(Strings.toString(block.timestamp));
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override initTuffKeeperLock {
        if (isIntervalComplete(block.timestamp)) {
            //    todo: check contract maturity & liquidate

            //    todo: run self balancing / use fees collected to add to LPs

            setLastTimestamp(block.timestamp);
        }
    }
}
