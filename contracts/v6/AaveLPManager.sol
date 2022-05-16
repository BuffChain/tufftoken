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

import {AaveLPManagerLib} from "./AaveLPManagerLib.sol";
import {IUniswapManager} from "./IUniswapManager.sol";
import {IUniswapPriceConsumer} from "./IUniswapPriceConsumer.sol";
import "./ITuffOwnerV6.sol";

contract AaveLPManager is Context {
    modifier onlyOwner() {
        ITuffOwnerV6(address(this)).requireOnlyOwner();
        _;
    }

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
    ) public onlyOwner {
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
        onlyOwner
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

        IERC20(erc20TokenAddr).approve(getAaveLPAddr(), amount);
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

    function addAaveSupportedToken(address tokenAddr, uint256 targetPercentage)
        public
        aaveInitLock
        onlyOwner
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
        ss.tokenMetadata[tokenAddr].targetPercent = targetPercentage;
        //TODO: Remove this to save gas? This cost gas to save, while reading it is a view function, so gas free
        ss.tokenMetadata[tokenAddr].aToken = aTokenAddr;
    }

    function removeAaveSupportedToken(address tokenAddr) public aaveInitLock onlyOwner {
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
    ) public aaveInitLock onlyOwner {
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

    function liquidateAaveTreasury() public aaveInitLock onlyOwner returns (bool) {
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
        onlyOwner
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

    function withdrawAllFromAave(address asset) public aaveInitLock onlyOwner {
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

    //This will be called from a keeper when actualPercentage deviates too far from targetPercentage. We will first
    // need to calculate current/actual percentages, then determine which tokens are over/under-invested, and finally
    // swap and deposit to balance the tokens based on their targetedPercentages
    //Note: Only buy tokens to balance instead of trying to balance by selling first then buying. This means
    // we do not have to sort, which helps saves on gas
    function balanceAaveLendingPool() public aaveInitLock onlyOwner {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();

        address[] memory supportedTokens = getAllAaveSupportedTokens();
        uint256[] memory tokensValueInWeth = new uint256[](
            supportedTokens.length
        );
        uint256[] memory tokensTargetWeight = new uint256[](
            supportedTokens.length
        );

        uint256 totalBalanceInWeth = 0;
        uint24 poolFee = 3000;

        // First loop through all tokens to aggregate their collective value and weights
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            uint256 aTokenBalance = getATokenBalance(supportedTokens[i]);

            // Get the value of each token in the same denomination, in this case WETH
            uint32 period = 60; //TODO: Make 3600?
            uint256 wethQuote = IUniswapPriceConsumer(address(this))
                .getUniswapQuote(
                    ss.wethAddr,
                    supportedTokens[i],
                    poolFee,
                    period
                );

            //Track balances
            uint256 tokenValueInWeth = SafeMath.mul(aTokenBalance, wethQuote);
            tokensValueInWeth[i] = tokenValueInWeth;

            totalBalanceInWeth = SafeMath.add(
                totalBalanceInWeth,
                tokenValueInWeth
            );
        }

        //Then, loop through again to balance tokens
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            //Calculate target percentage
            uint256 tokenTargetWeight = getAaveTokenTargetedPercentage(
                supportedTokens[i]
            );
            uint256 tokenTargetPercentage = SafeMath.div(
                tokenTargetWeight,
                ss.totalTargetWeight
            );

            //Calculate actual percentage
            uint256 tokenActualPercentage = SafeMath.div(
                tokensValueInWeth[i],
                totalBalanceInWeth
            );

            require(
                tokenTargetPercentage < uint256(-1),
                "Cannot cast tokenTargetPercentage - out of range of int max"
            );
            require(
                tokenActualPercentage < uint256(-1),
                "Cannot cast tokenActualPercentage - out of range of int max"
            );

            //Only balance if token is under-allocated more than our buffer amount
            int256 iPercentageDiff = int256(tokenTargetPercentage) -
                int256(tokenActualPercentage);
            if (iPercentageDiff > 0) {
                //Convert percentage to WETH value
                uint256 balanceOutAmountInWeth = SafeMath.mul(
                    totalBalanceInWeth,
                    uint256(iPercentageDiff)
                );

                IUniswapManager(address(this)).swapExactInputSingle(
                    supportedTokens[i],
                    poolFee,
                    ss.wethAddr,
                    balanceOutAmountInWeth
                );

                //TODO: Add event when balance swap occurs
            }
        }
    }
}
