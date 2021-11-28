// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts-v6/access/Ownable.sol";
import "@uniswap/v3-periphery/contracts/libraries/OracleLibrary.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "./IPriceConsumer.sol";

import { UniswapPriceConsumerLib } from "./UniswapPriceConsumerLib.sol";

contract UniswapPriceConsumer is Ownable, IPriceConsumer {
    modifier uniswapPriceConsumerInitLock() {
        require(isUniswapPriceConsumerInit(), 'Tuff.UniswapPriceConsumer: UNINITIALIZED');
        _;
    }

    function isUniswapPriceConsumerInit() public view returns (bool) {
        UniswapPriceConsumerLib.UniswapPriceConsumerStruct storage ss = UniswapPriceConsumerLib.uniswapPriceConsumerStorage();
        return ss.isInit;
    }

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initUniswapPoolDeployer(address _tokenA, address _tokenB, uint24 _fee, address _factoryAddress) public {
        require(!isUniswapPriceConsumerInit(), 'Tuff.UniswapPriceConsumer: ALREADY_INITIALIZED');

        UniswapPriceConsumerLib.UniswapPriceConsumerStruct storage ss = UniswapPriceConsumerLib.uniswapPriceConsumerStorage();

        ss.factoryAddr = _factoryAddress;
        ss.tokenA = _tokenA;
        ss.tokenB = _tokenB;
        ss.fee = _fee;
    }

    function getPoolAddress(address _tokenA, address _tokenB, uint24 _fee) public view onlyOwner returns (address) {
        UniswapPriceConsumerLib.UniswapPriceConsumerStruct storage ss = UniswapPriceConsumerLib.uniswapPriceConsumerStorage();
        return IUniswapV3Factory(ss.factoryAddr).getPool(_tokenA, _tokenB, _fee);
    }

    function getQuote(uint32 period) public view onlyOwner returns (uint256 quoteAmount) {
        UniswapPriceConsumerLib.UniswapPriceConsumerStruct storage ss = UniswapPriceConsumerLib.uniswapPriceConsumerStorage();

        address _poolAddress = getPoolAddress(ss.tokenA, ss.tokenB, ss.fee);

        (int24 timeWeightedAverageTick, uint128 _) = OracleLibrary.consult(_poolAddress, period);

        uint128 baseAmount = 1;
        uint256 _quoteAmount = OracleLibrary.getQuoteAtTick(timeWeightedAverageTick, baseAmount, ss.tokenA, ss.tokenB);

        return _quoteAmount;
    }

    function getPrice() public override view onlyOwner returns (uint256) {
        return getQuote(3600);
    }
}
