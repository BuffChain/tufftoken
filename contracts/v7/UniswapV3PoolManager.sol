// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.5.0 <0.8.0;

import "@openzeppelin/contracts-v6/access/Ownable.sol";
import "@uniswap/v3-periphery/contracts/libraries/OracleLibrary.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "./IPriceConsumer.sol";


contract UniswapV3PoolManager is Ownable, IPriceConsumer {

    address tokenA;
    address tokenB;
    uint24 fee;
    IUniswapV3Factory factory;

    constructor (address initialOwner) {
        transferOwnership(initialOwner);

        address uniswapFactoryAddr = address(0x1F98431c8aD98523631AE4a59f267346ea31F984);
        factory = IUniswapV3Factory(uniswapFactoryAddr);
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

    function getQuote(uint32 period) public view returns (uint256 quoteAmount) {

        address _poolAddress = getPoolAddress(tokenA, tokenB, fee);

        int24 timeWeightedAverageTick = OracleLibrary.consult(_poolAddress, period);

        uint128 baseAmount = 1;
        uint256 _quoteAmount = OracleLibrary.getQuoteAtTick(timeWeightedAverageTick, baseAmount, tokenA, tokenB);

        return _quoteAmount;

    }

    function getPrice() public override view returns (uint256) {
        return getQuote(60) * 10 ** 8;
    }

}
