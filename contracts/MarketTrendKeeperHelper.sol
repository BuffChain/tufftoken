// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;


contract MarketTrendKeeperHelper {

    function upkeepNeeded(uint lastTimeStamp, uint interval) public view returns (bool) {
        return (block.timestamp - lastTimeStamp) > interval;
    }

}
