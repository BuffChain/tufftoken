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
import {IUniswapPriceConsumer} from "./IUniswapPriceConsumer.sol";

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
    {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();

        address aTokenAddr = getATokenAddress(tokenAddr);
        require(
            aTokenAddr != address(0),
            "The tokenAddress provided is not supported by Aave"
        );

        //TODO: All targetPercentages should add up to 100%

        ss.supportedTokens.push(tokenAddr);
        ss.tokenMetadata[tokenAddr].targetPercent = targetPercentage;
        ss.tokenMetadata[tokenAddr].aToken = aTokenAddr;
    }

    function removeAaveSupportedToken(address tokenAddr) public aaveInitLock {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();

        (bool _isSupportedToken, uint256 _tokenIndex) = isAaveSupportedToken(
            tokenAddr
        );
        if (_isSupportedToken) {
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

    function getAaveIncome(address tokenAddr)
        public
        view
        aaveInitLock
        returns (uint256)
    {
        return
            LendingPool(getAaveLPAddr()).getReserveNormalizedIncome(tokenAddr);
    }

    function liquidateAaveTreasury() public aaveInitLock {
        address[] memory supportedTokens = getAllAaveSupportedTokens();
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            withdrawAllFromAave(supportedTokens[i]);
        }
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

    function getATokenBalance(address asset)
        public
        view
        aaveInitLock
        returns (uint256)
    {
        (
            uint256 currentATokenBalance,
            ,
            ,
            ,
            ,
            ,
            ,
            ,

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

    //"lite-balance"
    //This will be called from a keeper when our fee holdings have reached a threshold. We will first need to calculate
    // current/actual percentages, then determine which tokens are over/under-invested, and finally swap and deposit to
    // balance the tokens based on their targetedPercentages
    function balanceAaveLendingPoolWithTuffToken(address tokenAddr)
        public
        aaveInitLock
    {}

    //"full-balance"
    //This will be called from a keeper when actualPercentage deviates too far from targetPercentage. We will first
    // need to calculate current/actual percentages, then determine which tokens are over/under-invested, and finally
    // swap and deposit to balance the tokens based on their targetedPercentages

    //Note from meeting: Only buy tokens to balance instead of trying to balance by selling first then buying. This means
    //  we do not have to sort and only balance as much as possible
    function balanceAaveLendingPool() public aaveInitLock {
        AaveLPManagerLib.StateStorage storage ss = AaveLPManagerLib.getState();

        address[] memory supportedTokens = getAllAaveSupportedTokens();
        uint256[] memory tokensValueInWeth = new uint256[](
            supportedTokens.length
        );
        uint256[] memory tokensTargetWeight = new uint256[](
            supportedTokens.length
        );

        uint256 totalBalanceInWeth = 0;
        //TODO: Make this a class variable? Updated during each addition and removal of a supportedToken?
        uint256 totalTargetWeight = 0;

        // First loop through all tokens to aggregate their collective value and weights
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            uint256 aTokenBalance = getATokenBalance(supportedTokens[i]);

            // Get the value of each token in the same denomination, in this case WETH
            uint24 poolFee = 3000;
            //TODO: Make 3600?
            uint32 period = 60;

            uint256 wethQuote = IUniswapPriceConsumer(address(this))
                .getUniswapQuote(
                    ss.wethAddr,
                    supportedTokens[i],
                    poolFee,
                    period
                );

            //Track balances
            tokensValueInWeth[i] = SafeMath.mul(aTokenBalance, wethQuote);
            totalBalanceInWeth = SafeMath.add(
                totalBalanceInWeth,
                tokensValueInWeth[i]
            );

            //Track weights
            tokensTargetWeight[i] = getAaveTokenTargetedPercentage(
                supportedTokens[i]
            );
            totalTargetWeight = SafeMath.add(
                totalTargetWeight,
                tokensTargetWeight[i]
            );
        }

        //        uint256[] memory sortedWethValues = insertionSort(tokensValueInWeth);
        //
        //        //Then, loop through again to balance tokens
        //        for (uint256 i = 0; i < supportedTokens.length; i++) {
        //            //TODO: Add buffer, we don't want to swap if we are within spec
        //
        //            uint256 tokenTargetPercentage = SafeMath.div(tokensTargetWeight[i], totalTargetWeight);
        //            uint256 tokenActualPercentage = SafeMath.div(sortedWethValues[i], totalBalanceInWeth);
        //
        //            //The percentage that we have to balance out
        //            uint256 percentageDiff = SafeMath.sub(tokenTargetPercentage, tokenActualPercentage);
        //
        //            //Convert percentage to WETH value
        //            uint256 balanceOutAmountInWeth = SafeMath.sub(totalBalanceInWeth, percentageDiff);
        //
        //            //TODO: Update totalBalanceInWeth? Intuitively not, but leaving this here just in case
        //            //totalBalanceInWeth = SafeMath.sub(totalBalanceInWeth, tokensValueInWeth[i]);
        //            //totalBalanceInWeth = SafeMath.add(totalBalanceInWeth, balanceOutAmountInWeth);
        //
        //            //TODO: Add event when balance swap occurs
        //        }
    }
}
