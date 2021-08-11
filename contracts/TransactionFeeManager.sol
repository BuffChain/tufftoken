// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TransactionFeeManager is Ownable {

    uint256 public reflectionFee = 5;
    uint256 public farmFee = 5;

    function setReflectionFee(uint256 _reflectionFee) public onlyOwner {
        reflectionFee = _reflectionFee;
    }

    function setFarmFee(uint256 _farmFee) public onlyOwner {
        farmFee = _farmFee;
    }

    function getReflectionFee() public view returns (uint256) {
        return reflectionFee;
    }

    function getFarmFee() public view returns (uint256) {
        return farmFee;
    }
}
