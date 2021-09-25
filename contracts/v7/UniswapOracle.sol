// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.5.0 <0.8.0;

import "@uniswap/v3-periphery/contracts/libraries/OracleLibrary.sol";


contract UniswapOracle {

    address tokenAddr;
    address wethAddr = address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
    address uniswapPoolAddr;

    constructor (address _uniswapPoolAddr, address _tokenAddr) {
        uniswapPoolAddr = _uniswapPoolAddr;
        tokenAddr = _tokenAddr;
    }

    function getUniswapQuote() public view returns (uint256 quoteAmount) {

        uint32 period = 60;
        int24 timeWeightedAverageTick = OracleLibrary.consult(uniswapPoolAddr, period);

        uint128 baseAmount = 1;
        uint256 _quoteAmount = OracleLibrary.getQuoteAtTick(timeWeightedAverageTick, baseAmount, tokenAddr, wethAddr);

        return _quoteAmount;

    }

}
