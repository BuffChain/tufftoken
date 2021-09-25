// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";

contract PoolDeployer is Ownable {

    address tokenAddr;
    address wethAddr = address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
    mapping(string => address) providerPoolAddresses;

    constructor (address _tokenAddr) {
        tokenAddr = _tokenAddr;
    }


    function deployUniswapPool() public onlyOwner {

        address uniswapFactoryAddr = address(0x1F98431c8aD98523631AE4a59f267346ea31F984);
        IUniswapV3Factory factory = IUniswapV3Factory(uniswapFactoryAddr);

        uint24 fee = 500;

        address _uniswapPoolAddr = factory.getPool(tokenAddr, wethAddr, fee);

        if (_uniswapPoolAddr == address(0)) {
            factory.createPool(tokenAddr, wethAddr, fee);
        }

        _uniswapPoolAddr = factory.getPool(tokenAddr, wethAddr, fee);

        require(_uniswapPoolAddr == address(0), "pool address cannot be 0");

        providerPoolAddresses["UNISWAP"] = _uniswapPoolAddr;

    }

    function getProviderPoolAddr(string memory provider) public returns (address) {
        return providerPoolAddresses[provider];
    }

}
