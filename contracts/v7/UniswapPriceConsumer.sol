// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.7.0;

import "@uniswap/v3-periphery/contracts/libraries/OracleLibrary.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";

import {UniswapPriceConsumerLib} from "./UniswapPriceConsumerLib.sol";

contract UniswapPriceConsumer {
    modifier uniswapPriceConsumerInitLock() {
        require(isUniswapPriceConsumerInit(), 'Tuff.UniswapPriceConsumer: UNINITIALIZED');
        _;
    }

    function isUniswapPriceConsumerInit() public view returns (bool) {
        UniswapPriceConsumerLib.StateStorage storage ss = UniswapPriceConsumerLib.getState();
        return ss.isInit;
    }

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initUniswapPoolDeployer(address _tokenA, address _tokenB, uint24 _fee, address _factoryAddress) public {
        require(!isUniswapPriceConsumerInit(), 'Tuff.UniswapPriceConsumer: ALREADY_INITIALIZED');

        UniswapPriceConsumerLib.StateStorage storage ss = UniswapPriceConsumerLib.getState();

        ss.factoryAddr = _factoryAddress;
        ss.tokenA = _tokenA;
        ss.tokenB = _tokenB;
        ss.fee = _fee;
    }

    function getPoolAddress(address _tokenA, address _tokenB, uint24 _fee) public view uniswapPriceConsumerInitLock returns (address) {
        UniswapPriceConsumerLib.StateStorage storage ss = UniswapPriceConsumerLib.getState();
        return IUniswapV3Factory(ss.factoryAddr).getPool(_tokenA, _tokenB, _fee);
    }

    function getQuote(uint32 period) public view uniswapPriceConsumerInitLock returns (uint256 quoteAmount) {
        UniswapPriceConsumerLib.StateStorage storage ss = UniswapPriceConsumerLib.getState();

        address _poolAddress = getPoolAddress(ss.tokenA, ss.tokenB, ss.fee);

        (int24 timeWeightedAverageTick, uint128 _) = OracleLibrary.consult(_poolAddress, period);

        uint128 baseAmount = 1;
        uint256 _quoteAmount = OracleLibrary.getQuoteAtTick(timeWeightedAverageTick, baseAmount, ss.tokenA, ss.tokenB);

        return _quoteAmount;
    }

    function getUniswapPrice() external view uniswapPriceConsumerInitLock returns (uint256) {
        return getQuote(3600);
    }
}
