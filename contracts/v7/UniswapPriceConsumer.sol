// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.7.0;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import "@uniswap/v3-core/contracts/libraries/FixedPoint96.sol";
import "@uniswap/v3-core/contracts/libraries/FullMath.sol";
import "@uniswap/v3-periphery/contracts/libraries/OracleLibrary.sol";

import {UniswapPriceConsumerLib} from "./UniswapPriceConsumerLib.sol";

contract UniswapPriceConsumer {
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
        uint32 _period
    ) external view uniswapPriceConsumerInitLock returns (uint256) {
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

//        if (twapInterval == 0) {
//            (sqrtPriceX96, , , , , , ) = IUniswapV3Pool(poolAddress).slot0();
//            return FullMath.mulDiv(sqrtPriceX96, sqrtPriceX96, FixedPoint96.Q96);
//        } else {
//            uint32[] memory secondsAgos = new uint32[](2);
//            secondsAgos[0] = twapInterval;
//            secondsAgos[1] = 0;
//            (int56[] memory tickCumulatives, ) = IUniswapV3Pool(poolAddress).observe(secondsAgos);
//            uint160 sqrtPriceX96 = TickMath.getSqrtRatioAtTick(
//                int24((tickCumulatives[1] - tickCumulatives[0]) / twapInterval)
//            );
//
//
//            return FullMath.mulDiv(sqrtPriceX96, sqrtPriceX96, FixedPoint96.Q96);
//        }

        (int24 timeWeightedAverageTick, ) = OracleLibrary.consult(
            _poolAddr,
            _period
        );

        uint128 baseAmount = 1;
        return
            OracleLibrary.getQuoteAtTick(
                timeWeightedAverageTick,
                baseAmount,
                _tokenA,
                _tokenB
            );
    }
}
