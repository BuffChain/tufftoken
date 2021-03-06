// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.7.0;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "./TuffOwner.sol";

import {UniswapManagerLib} from "./UniswapManagerLib.sol";

/// @notice Uniswap utility contract to help with token swaps. Based on these docs
/// https://docs.uniswap.org/protocol/guides/swaps
contract UniswapManager {
    /// @dev functions with the onlyOwner modifier can only be called by the contract itself or the contract owner
    modifier onlyOwner() {
        TuffOwner(address(this)).requireOnlyOwner(msg.sender);
        _;
    }

    function isUniswapManagerInit() public view returns (bool) {
        UniswapManagerLib.StateStorage storage ss = UniswapManagerLib.getState();
        return ss.isInit;
    }

    /// @notice Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    /// constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    /// @dev modifier onlyOwner can only be called by the contract itself or the contract owner
    /// @param _swapRouter swap router address
    /// @param wethAddr WETH address
    /// @param basePoolFee uniswap base pool fee
    function initUniswapManager(
        ISwapRouter _swapRouter,
        address wethAddr,
        uint24 basePoolFee
    ) public onlyOwner {
        //UniswapManager Already Initialized
        require(!isUniswapManagerInit(), "UMAI");

        UniswapManagerLib.StateStorage storage ss = UniswapManagerLib.getState();

        ss.swapRouter = _swapRouter;
        ss.wethAddr = wethAddr;
        ss.basePoolFee = basePoolFee;
        ss.isInit = true;
    }

    //    based on https://docs.uniswap.org/protocol/guides/swaps/single-swaps
    /// @notice swapExactOutputSingle swaps a minimum possible amount of DAI for a fixed amount of WETH.
    /// @dev The calling address must approve this contract to spend its DAI for this function to succeed. As the amount of input DAI is variable,
    ///  the calling address will need to approve for a slightly higher amount, anticipating some variance.
    /// @dev modifier onlyOwner can only be called by the contract itself or the contract owner
    /// @param amountIn The exact amount of `outputToken` to receive from the swap.
    /// @param amountOutMinimum: The lowest amount of `outputToken` we are willing to receive from spending the `amountIn` of `inputToken`
    ///     Ideally, use an oracle or other data source to choose a safer value for amountOutMinimum.
    /// @return amountOut The amount of DAI actually spent in the swap.
    function swapExactInputSingle(
        address inputToken,
        address outputToken,
        uint24 poolFee,
        uint256 amountIn,
        uint256 amountOutMinimum
    ) external onlyOwner returns (uint256 amountOut) {
        UniswapManagerLib.StateStorage storage ss = UniswapManagerLib.getState();

        //Approve the router to spend `inputToken`
        TransferHelper.safeApprove(inputToken, address(ss.swapRouter), amountIn);

        //Set the sqrtPriceLimitx96 to be 0 to ensure we swap our exact input amount.
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: inputToken,
            tokenOut: outputToken,
            fee: poolFee,
            recipient: address(this),
            deadline: block.timestamp, // solhint-disable-line not-rely-on-time
            amountIn: amountIn,
            amountOutMinimum: amountOutMinimum,
            sqrtPriceLimitX96: 0
        });

        amountOut = ss.swapRouter.exactInputSingle(params);
    }

    /// @notice swapExactOutputSingle swaps a minimum possible amount of DAI for a fixed amount of WETH.
    /// @dev The calling address must approve this contract to spend its DAI for this function to succeed. As the amount of input DAI is variable,
    ///  the calling address will need to approve for a slightly higher amount, anticipating some variance.
    /// @dev modifier onlyOwner can only be called by the contract itself or the contract owner
    /// @param amountOut The exact amount of WETH9 to receive from the swap.
    /// @param amountInMaximum The amount of DAI we are willing to spend to receive the specified amount of WETH9.
    /// @return amountIn The amount of DAI actually spent in the swap.
    function swapExactOutputSingle(
        address inputToken,
        address outputToken,
        uint24 poolFee,
        uint256 amountOut,
        uint256 amountInMaximum
    ) external onlyOwner returns (uint256 amountIn) {
        UniswapManagerLib.StateStorage storage ss = UniswapManagerLib.getState();

        //Approve the router to spend the specified `amountInMaximum` of `inputToken`
        TransferHelper.safeApprove(inputToken, address(ss.swapRouter), amountInMaximum);

        ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter.ExactOutputSingleParams({
            tokenIn: inputToken,
            tokenOut: outputToken,
            fee: poolFee,
            recipient: address(this),
            deadline: block.timestamp, // solhint-disable-line not-rely-on-time
            amountOut: amountOut,
            amountInMaximum: amountInMaximum,
            sqrtPriceLimitX96: 0
        });

        //Executes the swap returning the amountIn needed to spend to receive the desired amountOut.
        amountIn = ss.swapRouter.exactOutputSingle(params);

        //For exact output swaps, the amountInMaximum may not have all been spent.
        // If the actual amount spent (amountIn) is less than the specified maximum amount, we must refund the
        // msg.sender and approve the swapRouter to spend 0.
        if (amountIn < amountInMaximum) {
            TransferHelper.safeApprove(inputToken, address(ss.swapRouter), 0);
            TransferHelper.safeTransfer(inputToken, address(this), amountInMaximum - amountIn);
        }
    }

    /// based on https://docs.uniswap.org/protocol/guides/swaps/multihop-swaps
    /// @dev modifier onlyOwner can only be called by the contract itself or the contract owner
    function swapExactInputMultihop(
        address inputToken,
        address outputToken,
        uint24 poolAFee,
        uint24 poolBFee,
        uint256 amountIn,
        uint256 amountOutMinimum
    ) external onlyOwner returns (uint256) {
        UniswapManagerLib.StateStorage storage ss = UniswapManagerLib.getState();

        //Approve the router to spend `inputToken`
        TransferHelper.safeApprove(inputToken, address(ss.swapRouter), amountIn);

        ISwapRouter.ExactInputParams memory params = ISwapRouter.ExactInputParams({
            path: abi.encodePacked(inputToken, poolAFee, ss.wethAddr, poolBFee, outputToken),
            recipient: address(this),
            deadline: block.timestamp, // solhint-disable-line not-rely-on-time
            amountIn: amountIn,
            amountOutMinimum: amountOutMinimum
        });

        return ss.swapRouter.exactInput(params);
    }
}
