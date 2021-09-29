// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts-v6/access/Ownable.sol";
import "@uniswap/v3-periphery/contracts/libraries/OracleLibrary.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "./IPriceConsumer.sol";


contract UniswapPriceConsumer is Ownable, IPriceConsumer {

    address tokenA;
    address tokenB;
    uint24 fee;
    IUniswapV3Factory factory;

    constructor (address initialOwner, address _tokenA, address _tokenB, uint24 _fee) {

        address uniswapFactoryAddr = address(0x1F98431c8aD98523631AE4a59f267346ea31F984);
        factory = IUniswapV3Factory(uniswapFactoryAddr);

        tokenA = _tokenA;
        tokenB = _tokenB;
        fee = _fee;

        transferOwnership(initialOwner);

    }

    function getPoolAddress(address _tokenA, address _tokenB, uint24 _fee) public view onlyOwner returns (
        address
    ) {
        return factory.getPool(_tokenA, _tokenB, _fee);
    }

    function getQuote(uint32 period) public view onlyOwner returns (uint256 quoteAmount) {

        address _poolAddress = getPoolAddress(tokenA, tokenB, fee);

        int24 timeWeightedAverageTick = OracleLibrary.consult(_poolAddress, period);

        uint128 baseAmount = 1;
        uint256 _quoteAmount = OracleLibrary.getQuoteAtTick(timeWeightedAverageTick, baseAmount, tokenA, tokenB);

        return _quoteAmount;

    }

    function getPrice() public override view onlyOwner returns (uint256) {
        return getQuote(3600);
    }

}
