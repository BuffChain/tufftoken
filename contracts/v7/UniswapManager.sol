// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.7.0;
pragma abicoder v2;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

import {UniswapManagerLib} from "./UniswapManagerLib.sol";

contract UniswapManager is IERC721Receiver {
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
        INonfungiblePositionManager _nonfungiblePositionManager,
        address WETHAddress
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
        ss.nonfungiblePositionManager = _nonfungiblePositionManager;
        ss.WETHAddress = WETHAddress;

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

    // Implementing `onERC721Received` so this contract can receive custody of erc721 tokens
    function onERC721Received(
        address operator,
        address,
        uint256 tokenId,
        bytes calldata
    ) external override returns (bytes4) {
        // get position information

        _createDeposit(operator, tokenId);

        return this.onERC721Received.selector;
    }

    function _createDeposit(address owner, uint256 tokenId) internal {
        UniswapManagerLib.StateStorage storage ss = UniswapManagerLib
            .getState();

        (
            ,
            ,
            address token0,
            address token1,
            ,
            ,
            ,
            uint128 liquidity,
            ,
            ,
            ,

        ) = ss.nonfungiblePositionManager.positions(tokenId);

        // set the owner and data for position
        // operator is msg.sender
        ss.deposits[tokenId] = UniswapManagerLib.Deposit({
            owner: owner,
            liquidity: liquidity,
            token0: token0,
            token1: token1
        });
    }

    /// @notice Calls the mint function defined in periphery, mints the same amount of each token.
    // Providing liquidity in both assets means liquidity will be earning fees and is considered in-range.
    /// @return tokenId The id of the newly minted ERC721
    /// @return liquidity The amount of liquidity for the position
    /// @return amount0 The amount of token0
    /// @return amount1 The amount of token1
    function mintNewPosition(
        address token0,
        uint256 amount0ToMint,
        address token1,
        uint256 amount1ToMint,
        uint24 poolFee
    )
        external
        returns (
            uint256 tokenId,
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        )
    {
        UniswapManagerLib.StateStorage storage ss = UniswapManagerLib
            .getState();

        // Approve the position manager
        TransferHelper.safeApprove(
            token0,
            address(ss.nonfungiblePositionManager),
            amount0ToMint
        );
        TransferHelper.safeApprove(
            token1,
            address(ss.nonfungiblePositionManager),
            amount1ToMint
        );

        INonfungiblePositionManager.MintParams
            memory params = INonfungiblePositionManager.MintParams({
                token0: token0,
                token1: token1,
                fee: poolFee,
                tickLower: TickMath.MIN_TICK,
                tickUpper: TickMath.MAX_TICK,
                amount0Desired: amount0ToMint,
                amount1Desired: amount1ToMint,
                amount0Min: 0,
                amount1Min: 0,
                recipient: address(this),
                deadline: block.timestamp
            });

        // Note that the pool defined by token0/token1 and fee tier must already be created and initialized in order to mint
        (tokenId, liquidity, amount0, amount1) = ss
            .nonfungiblePositionManager
            .mint(params);

        // Create a deposit
        _createDeposit(msg.sender, tokenId);

        // Remove allowance and refund in both assets.
        if (amount0 < amount0ToMint) {
            TransferHelper.safeApprove(
                token0,
                address(ss.nonfungiblePositionManager),
                0
            );
            uint256 refund0 = amount0ToMint - amount0;
            TransferHelper.safeTransfer(token0, msg.sender, refund0);
        }

        if (amount1 < amount1ToMint) {
            TransferHelper.safeApprove(
                token1,
                address(ss.nonfungiblePositionManager),
                0
            );
            uint256 refund1 = amount1ToMint - amount1;
            TransferHelper.safeTransfer(token1, msg.sender, refund1);
        }
    }
}
