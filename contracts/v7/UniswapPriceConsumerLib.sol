// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.7.0 <0.8.0;

library UniswapPriceConsumerLib {

    //IMPORTANT: You must increment this string if you add a new variable to UniswapPriceConsumerStruct that is not at the end
    bytes32 constant UniswapPriceConsumerLib_Position = keccak256("io.buffchain.tufftoken.uniswappriceconsumer.1");

    struct UniswapPriceConsumerStruct {
        bool isInit;
        address tokenA;
        address tokenB;
        uint24 fee;
        address factoryAddr;
//        IUniswapV3Factory factory;
    }

    function uniswapPriceConsumerStorage() internal pure returns (UniswapPriceConsumerStruct storage uniswapPriceConsumerStruct) {
        bytes32 position = UniswapPriceConsumerLib_Position;

        //In solidity > 0.7, inline assembly slot and offset variables are referenced with a period. For instance,
        // variable `x` is referenced by `x.slot`
        assembly {
            uniswapPriceConsumerStruct.slot := position
        }
    }
}
