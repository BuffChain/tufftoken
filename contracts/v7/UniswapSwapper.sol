// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.7.0;
pragma abicoder v2;

import {TransferHelper} from "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import {ISwapRouter} from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

import {UniswapSwapperLib} from "./UniswapSwapperLib.sol";

contract UniswapSwapper {
    modifier uniswapSwapperInitLock() {
        require(
            isUniswapSwapperInit(),
            string(
                abi.encodePacked(
                    UniswapSwapperLib.NAMESPACE,
                    ": ",
                    "UNINITIALIZED"
                )
            )
        );
        _;
    }

    function isUniswapSwapperInit() public view returns (bool) {
        UniswapSwapperLib.StateStorage storage ss = UniswapSwapperLib
            .getState();
        return ss.isInit;
    }

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initUniswapSwapper(ISwapRouter _swapRouter) public {
        require(
            !isUniswapSwapperInit(),
            string(
                abi.encodePacked(
                    UniswapSwapperLib.NAMESPACE,
                    ": ",
                    "ALREADY_INITIALIZED"
                )
            )
        );

        UniswapSwapperLib.StateStorage storage ss = UniswapSwapperLib
            .getState();

        ss.swapRouter = _swapRouter;

        ss.isInit = true;
    }

    /// based on https://docs.uniswap.org/protocol/guides/swaps/multihop-swaps
    function swapExactInputMultihop(
        address inputToken,
        uint256 poolAFee,
        address intermediateToken,
        uint256 poolBFee,
        address outputToken,
        uint256 amountIn
    ) external returns (uint256 amountOut) {
        UniswapSwapperLib.StateStorage storage ss = UniswapSwapperLib
            .getState();

        // Transfer `amountIn` of DAI to this contract.
        TransferHelper.safeTransferFrom(
            inputToken,
            address(this),
            address(this),
            amountIn
        );

        // Approve the router to spend DAI.
        TransferHelper.safeApprove(
            inputToken,
            address(ss.swapRouter),
            amountIn
        );

        // Multiple pool swaps are encoded through bytes called a `path`. A path is a sequence of token addresses and poolFees that define the pools used in the swaps.
        // The format for pool encoding is (tokenIn, fee, tokenOut/tokenIn, fee, tokenOut) where tokenIn/tokenOut parameter is the shared token across the pools.
        // Since we are swapping DAI to USDC and then USDC to WETH9 the path encoding is (DAI, 0.3%, USDC, 0.3%, WETH9).
        ISwapRouter.ExactInputParams memory params = ISwapRouter
            .ExactInputParams({
                path: abi.encodePacked(
                    inputToken,
                    poolAFee,
                    intermediateToken,
                    poolBFee,
                    outputToken
                ),
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0
            });

        // Executes the swap.
        amountOut = ss.swapRouter.exactInput(params);
    }

    function swapExactInputSingle(
        address inputToken,
        uint24 poolFee,
        address outputToken,
        uint256 amountIn
    ) external returns (uint256 amountOut) {
        UniswapSwapperLib.StateStorage storage ss = UniswapSwapperLib
            .getState();

        // msg.sender must approve this contract

        // Transfer the specified amount of DAI to this contract.
        TransferHelper.safeTransferFrom(
            inputToken,
            address(this),
            address(this),
            amountIn
        );

        // Approve the router to spend DAI.
        TransferHelper.safeApprove(
            inputToken,
            address(ss.swapRouter),
            amountIn
        );

        // Naively set amountOutMinimum to 0. In production, use an oracle or other data source to choose a safer value for amountOutMinimum.
        // We also set the sqrtPriceLimitx96 to be 0 to ensure we swap our exact input amount.
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: inputToken,
                tokenOut: outputToken,
                fee: poolFee,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // The call to `exactInputSingle` executes the swap.
        amountOut = ss.swapRouter.exactInputSingle(params);
    }
}
