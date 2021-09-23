// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract FarmTreasury is Context, Ownable  {

    address aaveLPManagerAddr;

    constructor(address _aaveLPManagerAddr) {
        aaveLPManagerAddr = _aaveLPManagerAddr;
    }

    function setAaveLPManager(address _aaveLPManagerAddr) public onlyOwner {
        aaveLPManagerAddr = _aaveLPManagerAddr;
    }

    receive() external payable {}
}
