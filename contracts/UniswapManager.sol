// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.7.0;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

import {UniswapManagerLib} from "./UniswapManagerLib.sol";

contract UniswapManager {
    modifier uniswapManagerInitLock() {
        require(
            isUniswapManagerInit(),
            string(
                abi.encodePacked(
                    UniswapManagerLib.NAMESPACE,
                    ": ",
                    "UNINITIALIZED"
                )
            )
        );
        _;
    }

    function isUniswapManagerInit() public view returns (bool) {
        UniswapManagerLib.StateStorage storage ss = UniswapManagerLib
            .getState();
        return ss.isInit;
    }

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initUniswapManager(
        ISwapRouter _swapRouter,
        address WETHAddress,
        uint24 basePoolFee
    ) public {
        require(
            !isUniswapManagerInit(),
            string(
                abi.encodePacked(
                    UniswapManagerLib.NAMESPACE,
                    ": ",
                    "ALREADY_INITIALIZED"
                )
            )
        );

        UniswapManagerLib.StateStorage storage ss = UniswapManagerLib
            .getState();

        ss.swapRouter = _swapRouter;
        ss.WETHAddress = WETHAddress;
        ss.basePoolFee = basePoolFee;
        ss.isInit = true;
    }

    /// based on https://docs.uniswap.org/protocol/guides/swaps/multihop-swaps
    function swapExactInputMultihop(
        address inputToken,
        uint256 poolAFee,
        uint256 poolBFee,
        address outputToken,
        uint256 amountIn
    ) external returns (uint256 amountOut) {
        UniswapManagerLib.StateStorage storage ss = UniswapManagerLib
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
                    ss.WETHAddress,
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

    //    based on https://docs.uniswap.org/protocol/guides/swaps/single-swaps
    function swapExactInputSingle(
        address inputToken,
        uint24 poolFee,
        address outputToken,
        uint256 amountIn
    ) external returns (uint256 amountOut) {
        UniswapManagerLib.StateStorage storage ss = UniswapManagerLib
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
