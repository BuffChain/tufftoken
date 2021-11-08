// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";

contract FarmTreasury is Context {

    address aaveLPManagerAddr;

    function setAaveLPManager(address _aaveLPManagerAddr) public {
        aaveLPManagerAddr = _aaveLPManagerAddr;
    }

    receive() external payable {}
}
