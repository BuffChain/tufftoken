// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract FarmTreasury is Ownable {

    address aaveLPManagerAddr;

    function setAaveLPManagerAddr(address _aaveLPManagerAddr) public onlyOwner {
        aaveLPManagerAddr = _aaveLPManagerAddr;
    }
}
