// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.7.0;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import "@uniswap/v3-core/contracts/libraries/FixedPoint96.sol";
import "@uniswap/v3-core/contracts/libraries/FullMath.sol";
import "@uniswap/v3-periphery/contracts/libraries/OracleLibrary.sol";
import "@chainlink/contracts/src/v0.7/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts-v6/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-v6/math/SafeMath.sol";

import {PriceConsumerLib} from "./PriceConsumerLib.sol";

contract PriceConsumer {
    using SafeMath for uint256;

    function isPriceConsumerInit() public view returns (bool) {
        PriceConsumerLib.StateStorage storage ss = PriceConsumerLib.getState();
        return ss.isInit;
    }

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initPriceConsumer(address _factoryAddr) public {
        //PriceConsumer Already Initialized
        require(!isPriceConsumerInit(), "PCAI");

        PriceConsumerLib.StateStorage storage ss = PriceConsumerLib.getState();

        ss.factoryAddr = _factoryAddr;
        ss.isInit = true;
    }

    function getTvbtWethQuote(uint32 _period) external view returns (uint256, uint128) {
        PriceConsumerLib.StateStorage storage ss = PriceConsumerLib.getState();

        address _tokenA = address(this);
        address _tokenB = address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
        uint24 _fee = 3000;
        uint8 _decimalPrecision = 18;

        address _poolAddr = IUniswapV3Factory(ss.factoryAddr).getPool(_tokenA, _tokenB, _fee);

        //PDE: Pool does not exist
        require(_poolAddr != address(0), "PDE");

        (int24 timeWeightedAverageTick, ) = OracleLibrary.consult(_poolAddr, _period);

        uint256 quoteAmt = OracleLibrary.getQuoteAtTick(
            timeWeightedAverageTick,
            uint128(10**_decimalPrecision),
            _tokenA,
            _tokenB
        );
        //LDP: Low Decimal Precision
        require(quoteAmt > 0, "LDP");

        return (quoteAmt, _decimalPrecision);
    }

    ///ChainLink price feed functions
    function getLatestRoundData(address _aggregatorAddr)
        public
        view
        returns (
            uint80,
            int256,
            uint256,
            uint256,
            uint80
        )
    {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(_aggregatorAddr);
        return priceFeed.latestRoundData();
    }

    function getDecimals(address _aggregatorAddr) public view returns (uint8) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(_aggregatorAddr);
        return priceFeed.decimals();
    }

    function getChainLinkPrice(address _aggregatorAddr) external view returns (uint256) {
        (, int256 price, , , ) = getLatestRoundData(_aggregatorAddr);
        return uint256(price);
    }
}
