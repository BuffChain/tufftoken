// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.7.0;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import "@uniswap/v3-core/contracts/libraries/FixedPoint96.sol";
import "@uniswap/v3-core/contracts/libraries/FullMath.sol";
import "@uniswap/v3-periphery/contracts/libraries/OracleLibrary.sol";
import "@openzeppelin/contracts-v6/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-v6/math/SafeMath.sol";

import {UniswapPriceConsumerLib} from "./UniswapPriceConsumerLib.sol";

import "hardhat/console.sol";

contract UniswapPriceConsumer {

    using SafeMath for uint256;

    modifier uniswapPriceConsumerInitLock() {
        require(
            isUniswapPriceConsumerInit(),
            string(
                abi.encodePacked(
                    UniswapPriceConsumerLib.NAMESPACE,
                    ": ",
                    "UNINITIALIZED"
                )
            )
        );
        _;
    }

    function isUniswapPriceConsumerInit() public view returns (bool) {
        UniswapPriceConsumerLib.StateStorage
        storage ss = UniswapPriceConsumerLib.getState();
        return ss.isInit;
    }

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initUniswapPriceConsumer(address _factoryAddr) public {
        require(
            !isUniswapPriceConsumerInit(),
            string(
                abi.encodePacked(
                    UniswapPriceConsumerLib.NAMESPACE,
                    ": ",
                    "ALREADY_INITIALIZED"
                )
            )
        );

        UniswapPriceConsumerLib.StateStorage
        storage ss = UniswapPriceConsumerLib.getState();

        ss.factoryAddr = _factoryAddr;
        ss.isInit = true;
    }

    function getUniswapQuote(
        address _tokenA,
        address _tokenB,
        uint24 _fee,
        uint32 _period,
        uint8 _decimalPrecision
    ) external view uniswapPriceConsumerInitLock returns (uint256, uint128) {
        UniswapPriceConsumerLib.StateStorage
        storage ss = UniswapPriceConsumerLib.getState();

        address _poolAddr = IUniswapV3Factory(ss.factoryAddr).getPool(
            _tokenA,
            _tokenB,
            _fee
        );
        require(
            _poolAddr != address(0),
            string(
                abi.encodePacked(
                    UniswapPriceConsumerLib.NAMESPACE,
                    ": ",
                    "Pool does not exist"
                )
            )
        );

        (int24 timeWeightedAverageTick,) = OracleLibrary.consult(
            _poolAddr,
            _period
        );

        uint256 quoteAmt =
            OracleLibrary.getQuoteAtTick(
                timeWeightedAverageTick,
                uint128(10 ** _decimalPrecision),
                _tokenA,
                _tokenB
            );
        //LDP: Low Decimal Precision
        require(quoteAmt > 0, "LDP");

        uint8 _tokenADecimals = ERC20(_tokenA).decimals();
        uint8 _tokenBDecimals = ERC20(_tokenB).decimals();
        int8 baseFactor = int8(_tokenADecimals - _tokenBDecimals);
        uint8 totalDecimalPrecision = 0;
        if (baseFactor < 0) {
            totalDecimalPrecision = uint8(-baseFactor) - _decimalPrecision;
        } else {
            totalDecimalPrecision = uint8(baseFactor) - _decimalPrecision;
        }

//        uint8 totalDecimalPrecision = _tokenADecimals - _tokenBDecimals - _decimalPrecision;

        console.log(quoteAmt);
        console.log(_decimalPrecision);
        console.log(_tokenADecimals);
        console.log(_tokenBDecimals);
        console.log(totalDecimalPrecision);

        return (quoteAmt, totalDecimalPrecision);
    }
}
