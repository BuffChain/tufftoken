// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.0;

import "@openzeppelin/contracts-v6/math/SafeMath.sol";
import {Context} from "@openzeppelin/contracts-v6/utils/Context.sol";
import {LendingPool} from "@aave/protocol-v2/contracts/protocol/lendingpool/LendingPool.sol";
import {LendingPoolAddressesProvider} from "@aave/protocol-v2/contracts/protocol/configuration/LendingPoolAddressesProvider.sol";
import {AaveProtocolDataProvider} from "@aave/protocol-v2/contracts/misc/AaveProtocolDataProvider.sol";
import {IUniswapV3Factory} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {IERC20} from "@openzeppelin/contracts-v6/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts-v6/token/ERC20/ERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts-v6/token/ERC20/SafeERC20.sol";

import {AaveLPManagerLib} from "./AaveLPManagerLib.sol";
import {IUniswapManager} from "./IUniswapManager.sol";
import {IChainLinkPriceConsumer} from "./IChainLinkPriceConsumer.sol";

import "hardhat/console.sol";

contract AaveLPManager is Context {
    modifier aaveInitLock() {
        require(
            isAaveInit(),
            string(
                abi.encodePacked(
                    AaveLPManagerLib.NAMESPACE,
                    ": ",
                    "UNINITIALIZED"
                )
            )
        );
        _;
    }

    using SafeMath for uint256;

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initAaveLPManager(
        address _lendingPoolProviderAddr,
        address _protocolDataProviderAddr,
        address _wethAddr
    ) public {
        require(
            !isAaveInit(),
            string(
                abi.encodePacked(
                    AaveLPManagerLib.NAMESPACE,
                    ": ",
                    "ALREADY_INITIALIZED"
                )
            )
        );

        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();

        ss.lpProviderAddr = _lendingPoolProviderAddr;
        ss.protocolDataProviderAddr = _protocolDataProviderAddr;
        ss.wethAddr = _wethAddr;
        ss.totalTargetWeight = 0;
        ss.decimalPrecision = 1e4;

        ss.isInit = true;
    }

    function isAaveInit() public view returns (bool) {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();
        return ss.isInit;
    }

    function getAaveLPAddr() public view aaveInitLock returns (address) {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();
        return LendingPoolAddressesProvider(ss.lpProviderAddr).getLendingPool();
    }

    function getProtocolDataProviderAddr()
        public
        view
        aaveInitLock
        returns (address)
    {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();
        return ss.protocolDataProviderAddr;
    }

    //TODO: Need to make sure this is locked down to only owner and approved callers (eg chainlink)
    function depositToAave(address erc20TokenAddr, uint256 amount)
        public
        aaveInitLock
    {
        (bool _isSupportedToken, ) = isAaveSupportedToken(erc20TokenAddr);
        require(
            _isSupportedToken,
            string(
                abi.encodePacked(
                    AaveLPManagerLib.NAMESPACE,
                    ": ",
                    "This token is currently not supported"
                )
            )
        );

        SafeERC20.safeApprove(IERC20(erc20TokenAddr), getAaveLPAddr(), amount);
        LendingPool(getAaveLPAddr()).deposit(
            erc20TokenAddr,
            amount,
            address(this),
            0
        );
    }

    function isAaveSupportedToken(address tokenAddr)
        public
        view
        aaveInitLock
        returns (bool, uint256)
    {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();

        bool _isSupportedToken = false;
        uint256 _tokenIndex = ss.supportedTokens.length;
        for (uint256 i = 0; i < ss.supportedTokens.length; i++) {
            if (ss.supportedTokens[i] == tokenAddr) {
                _isSupportedToken = true;
                _tokenIndex = i;
                break;
            }
        }

        return (_isSupportedToken, _tokenIndex);
    }

    function addAaveSupportedToken(address tokenAddr, address chainlinkEthTokenAggrAddr, uint256 targetPercentage)
        public
        aaveInitLock
    {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();

        address aTokenAddr = getATokenAddress(tokenAddr);
        require(
            aTokenAddr != address(0),
            "The tokenAddress provided is not supported by Aave"
        );

        ss.supportedTokens.push(tokenAddr);
        ss.totalTargetWeight = SafeMath.add(
            ss.totalTargetWeight,
            targetPercentage
        );
        ss.tokenMetadata[tokenAddr].chainlinkEthTokenAggrAddr = chainlinkEthTokenAggrAddr;
        ss.tokenMetadata[tokenAddr].targetPercent = targetPercentage;
        //TODO: Remove this to save gas? This cost gas to save, while reading it is a view function, so gas free
        ss.tokenMetadata[tokenAddr].aToken = aTokenAddr;
    }

    function removeAaveSupportedToken(address tokenAddr) public aaveInitLock {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();

        (bool _isSupportedToken, uint256 _tokenIndex) = isAaveSupportedToken(
            tokenAddr
        );
        if (_isSupportedToken) {
            ss.totalTargetWeight = SafeMath.sub(
                ss.totalTargetWeight,
                ss.tokenMetadata[tokenAddr].targetPercent
            );

            //Remove the token without preserving order
            ss.supportedTokens[_tokenIndex] = ss.supportedTokens[
                ss.supportedTokens.length - 1
            ];
            ss.supportedTokens.pop();
        }

        //TODO: Remove tokenMetadata as well?
    }

    function getAllAaveSupportedTokens()
        public
        view
        aaveInitLock
        returns (address[] memory)
    {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();
        return ss.supportedTokens;
    }

    function setAaveTokenTargetedPercentage(
        address tokenAddr,
        uint256 targetPercentage
    ) public aaveInitLock {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();

        ss.totalTargetWeight = SafeMath.sub(
            ss.totalTargetWeight,
            ss.tokenMetadata[tokenAddr].targetPercent
        );
        ss.totalTargetWeight = SafeMath.add(
            ss.totalTargetWeight,
            targetPercentage
        );

        ss.tokenMetadata[tokenAddr].targetPercent = targetPercentage;
    }

    function getAaveTokenTargetedPercentage(address tokenAddr)
        public
        view
        aaveInitLock
        returns (uint256)
    {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();
        return ss.tokenMetadata[tokenAddr].targetPercent;
    }

    function getAaveTotalTargetWeight()
        public
        view
        aaveInitLock
        returns (uint256)
    {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();
        return ss.totalTargetWeight;
    }

    function getAaveIncome(address tokenAddr)
        public
        view
        aaveInitLock
        returns (uint256)
    {
        return
            LendingPool(getAaveLPAddr()).getReserveNormalizedIncome(tokenAddr);
    }

    function liquidateAaveTreasury() public aaveInitLock returns (bool) {
        address[] memory supportedTokens = getAllAaveSupportedTokens();
        bool allTokensWithdrawn = true;
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            withdrawAllFromAave(supportedTokens[i]);
            uint256 remainingAmount = getATokenBalance(supportedTokens[i]);
            if (remainingAmount > 0) {
                allTokensWithdrawn = false;
            }
        }
        return allTokensWithdrawn;
    }

    function withdrawFromAave(address erc20TokenAddr, uint256 amount)
        public
        aaveInitLock
        returns (uint256)
    {
        (bool _isSupportedToken, ) = isAaveSupportedToken(erc20TokenAddr);
        require(
            _isSupportedToken,
            string(
                abi.encodePacked(
                    AaveLPManagerLib.NAMESPACE,
                    ": ",
                    "This token is not currently supported"
                )
            )
        );

        if (getATokenBalance(erc20TokenAddr) == 0) {
            return 0;
        }

        return
            LendingPool(getAaveLPAddr()).withdraw(
                erc20TokenAddr,
                amount,
                address(this)
            );
    }

    function withdrawAllFromAave(address asset) public aaveInitLock {
        withdrawFromAave(asset, type(uint256).max);
    }

    //`asset` is the token address, not aToken address
    function getATokenBalance(address asset)
        public
        view
        aaveInitLock
        returns (uint256)
    {
        (
            uint256 currentATokenBalance,
            uint256 currentStableDebt,
            uint256 currentVariableDebt,
            uint256 principalStableDebt,
            uint256 scaledVariableDebt,
            uint256 stableBorrowRate,
            uint256 liquidityRate,
            uint40 stableRateLastUpdated,
            bool usageAsCollateralEnabled
        ) = AaveProtocolDataProvider(getProtocolDataProviderAddr())
                .getUserReserveData(asset, address(this));
        return currentATokenBalance;
    }

    function getATokenAddress(address asset)
        public
        view
        aaveInitLock
        returns (address)
    {
        (address aTokenAddress, , ) = AaveProtocolDataProvider(
            getProtocolDataProviderAddr()
        ).getReserveTokensAddresses(asset);
        return aTokenAddress;
    }

    /**
     * @dev Emitted when a swap occurs to balance an under-balanced token
     */
    event AaveLPManagerBalanceSwap(address tokenSwappedFor, uint256 amount);

    //Using the struct to avoid Stack too deep error
    struct BalanceMetadata {
        address[] supportedTokens;
        uint256[] tokensValueInWeth;
        uint256[] tokensTargetWeight;
        uint256 totalBalanceInWeth;
        uint24 poolFee;
        uint24 balanceBuffer;
        uint256 treasuryBalance;
    }

    //This will be called from a keeper when actualPercentage deviates too far from targetPercentage. We will first
    // need to calculate current/actual percentages, then determine which tokens are over/under-invested, and finally
    // swap and deposit to balance the tokens based on their targetedPercentages
    //Note: Only buy tokens to balance instead of trying to balance by selling first then buying. This means
    // we do not have to sort, which helps saves on gas
    function balanceAaveLendingPool() public aaveInitLock {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();
        BalanceMetadata memory bm;

        bm.supportedTokens = getAllAaveSupportedTokens();
        bm.tokensValueInWeth = new uint256[](
            bm.supportedTokens.length
        );
        bm.tokensTargetWeight = new uint256[](
            bm.supportedTokens.length
        );

        bm.totalBalanceInWeth = 0;
        bm.poolFee = 3000;                              //0.3%
        bm.balanceBuffer = 3 * ss.decimalPrecision;     //3%
        console.log("bm.balanceBuffer");
        console.log(ss.decimalPrecision);
        console.log(bm.balanceBuffer);

        bm.treasuryBalance = IERC20(address(this)).balanceOf(
            address(this)
        );

        // First loop through all tokens to aggregate their collective value and weights
        for (uint256 i = 0; i < bm.supportedTokens.length; i++) {
            //Get and normalize aTokenBalance
            uint256 aTokenBalance = SafeMath.mul(
                getATokenBalance(bm.supportedTokens[i]),
                10 ** uint256(18 - ERC20(bm.supportedTokens[i]).decimals()));

            // Get the value of each token in the same denomination, in this case WETH
            //@dev: Order of tokanA and tokenB are important here
            uint256 wethQuote = IChainLinkPriceConsumer(address(this))
                .getChainLinkPrice(
                    ss.tokenMetadata[bm.supportedTokens[i]].chainlinkEthTokenAggrAddr
                );

            //Track balances
            uint256 tokenValueInWeth = SafeMath.mul(aTokenBalance, wethQuote);
            console.log("Balances:");
            console.log(wethQuote);
            console.log(aTokenBalance);
            console.log(tokenValueInWeth);
            bm.tokensValueInWeth[i] = tokenValueInWeth;

            bm.totalBalanceInWeth = SafeMath.add(
                bm.totalBalanceInWeth,
                tokenValueInWeth
            );
        }

        //Then, loop through again to balance tokens
        for (uint256 i = 0; i < bm.supportedTokens.length; i++) {
            //Calculate target and actual percentage. Include decimal precision in numerator and multiple by 100 to
            // convert from decimal to percent
            uint256 tokenTargetWeight = getAaveTokenTargetedPercentage(bm.supportedTokens[i]);
            uint256 tokenTargetPercentage = SafeMath.div(
                SafeMath.mul(tokenTargetWeight, 100 * ss.decimalPrecision), ss.totalTargetWeight);
            uint256 tokenActualPercentage = SafeMath.div(
                SafeMath.mul(bm.tokensValueInWeth[i], 100 * ss.decimalPrecision), bm.totalBalanceInWeth);

            require(tokenTargetPercentage < uint(-1), "Cannot cast tokenTargetPercentage - out of range of int max");
            require(tokenActualPercentage < uint(-1), "Cannot cast tokenActualPercentage - out of range of int max");

            //Only balance if token is under-allocated more than our buffer amount
            int256 iPercentageDiff = int(tokenTargetPercentage) - int(tokenActualPercentage);
            console.log("Percentages:");
            console.log(bm.tokensValueInWeth[i]);
            console.log(bm.totalBalanceInWeth);
            console.log(tokenTargetWeight);
            console.log(tokenTargetPercentage);
            console.log(tokenActualPercentage);
            console.log(uint256(iPercentageDiff));
            if (iPercentageDiff > bm.balanceBuffer) {
                console.log("Positive diff data:");
                console.log(bm.treasuryBalance);
                console.log(bm.supportedTokens.length);

                //Get proportional balance for the token
                uint256 balanceIn = SafeMath.div(bm.treasuryBalance, bm.supportedTokens.length);
                console.log(balanceIn);

                if (balanceIn > 0) {
                    SafeERC20.safeApprove(IERC20(address(this)), address(this), balanceIn);

                    //TODO: Need to pass minAmount to swap for
                    //uint256 amountLUSDMin = amountWethToSwap * minETHLUSDRate;

                    IUniswapManager(address(this)).swapExactInputMultihop(
                        address(this),
                        bm.poolFee,
                        bm.poolFee,
                        bm.supportedTokens[i],
                        balanceIn
                    );

                    emit AaveLPManagerBalanceSwap(bm.supportedTokens[i], balanceIn);
                }
            }
        }
    }
}
