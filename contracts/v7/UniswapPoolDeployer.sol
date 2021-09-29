// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts-v6/access/Ownable.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";


contract UniswapPoolDeployer is Ownable {

    address tokenA;
    address tokenB;
    uint24 fee;
    IUniswapV3Factory factory;

    constructor (address initialOwner, address _tokenA, address _tokenB, uint24 _fee) {

        address uniswapFactoryAddr = address(0x1F98431c8aD98523631AE4a59f267346ea31F984);
        factory = IUniswapV3Factory(uniswapFactoryAddr);

        setPool(_tokenA, _tokenB, _fee);

        transferOwnership(initialOwner);

    }

    function setPool(address _tokenA, address _tokenB, uint24 _fee) public onlyOwner {

        address _poolAddress = getPoolAddress(_tokenA, _tokenB, _fee);

        if (_poolAddress == address(0)) {
            factory.createPool(_tokenA, _tokenB, _fee);
            _poolAddress = getPoolAddress(_tokenA, _tokenB, _fee);
        }

        tokenA = _tokenA;
        tokenB = _tokenB;
        fee = _fee;

    }

    function getPoolAddress(address _tokenA, address _tokenB, uint24 _fee) public view returns (
        address
    ) {
        return factory.getPool(_tokenA, _tokenB, _fee);
    }

}
