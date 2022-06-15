// SPDX-License-Identifier: agpl-3.0

pragma solidity ^0.8.0;
import {TuffVBT} from "./TuffVBT.sol";
import {TokenMaturityLib} from "./TokenMaturityLib.sol";
import {UniswapManager} from "./UniswapManager.sol";
import {UniswapManagerLib} from "./UniswapManagerLib.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IWETH9} from "./IWETH9.sol";
import {IAaveLPManager} from "./IAaveLPManager.sol";
import "./TuffOwner.sol";

contract TokenMaturity {
    modifier onlyOwner() {
        TuffOwner(address(this)).requireOnlyOwner(msg.sender);
        _;
    }

    using SafeMath for uint256;

    function initTokenMaturity(uint256 daysUntilMaturity) public onlyOwner {
        require(
            !isTokenMaturityInit(),
            string(abi.encodePacked(TokenMaturityLib.NAMESPACE, ": ", "ALREADY_INITIALIZED"))
        );

        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();

        ss.contractMaturityTimestamp = block.timestamp + (daysUntilMaturity * 1 days);

        ss.isTreasuryLiquidated = false;

        TuffVBT tuffVBT = TuffVBT(payable(address(this)));
        ss.totalSupplyForRedemption = tuffVBT.totalSupply();
        ss.startingEthBalance = address(this).balance;

        ss.isInit = true;
    }

    /**
     * @dev Emitted when treasury has been liquidated
     * with the contract's ETH balance and total supply of redeemable tokens
     */
    event TokenMatured(uint256 balance, uint256 totalSupply);

    /**
     * @dev Emitted when holder redeems tokens for ETH
     */
    event Redeemed(address holder, uint256 tuffBalance, uint256 ethAmount);

    function isTokenMaturityInit() public view returns (bool) {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return ss.isInit;
    }

    function getContractMaturityTimestamp() public view returns (uint256) {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return ss.contractMaturityTimestamp;
    }

    function setContractMaturityTimestamp(uint256 timestamp) public onlyOwner {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        ss.contractMaturityTimestamp = timestamp;
    }

    function isTokenMatured(uint256 timestamp) public view returns (bool) {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return timestamp >= ss.contractMaturityTimestamp;
    }

    function totalSupplyForRedemption() public view returns (uint256) {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return ss.totalSupplyForRedemption;
    }

    function setTotalSupplyForRedemption(uint256 _totalSupplyForRedemption) public onlyOwner {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        ss.totalSupplyForRedemption = _totalSupplyForRedemption;
    }

    function getContractStartingEthBalance() public view returns (uint256) {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return ss.startingEthBalance;
    }

    function setContractStartingEthBalance(uint256 startingEthBalance) public onlyOwner {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        ss.startingEthBalance = startingEthBalance;
    }

    function getRedemptionAmount(uint256 ownerBalance) public view returns (uint256) {
        if (ownerBalance == 0) {
            return 0;
        }
        return getContractStartingEthBalance().mul(ownerBalance).div(totalSupplyForRedemption());
    }

    function getIsTreasuryLiquidated() public view returns (bool) {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return ss.isTreasuryLiquidated;
    }

    function setIsTreasuryLiquidated(bool _isTreasuryLiquidated) public onlyOwner {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        ss.isTreasuryLiquidated = _isTreasuryLiquidated;
    }

    function redeem() public {
        require(isTokenMatured(block.timestamp), "Address can not redeem before expiration.");

        require(getIsTreasuryLiquidated(), "Address can not redeem before treasury has been liquidated.");

        address payable account = payable(msg.sender);

        (bool _hasRedeemed, ) = hasRedeemed(account);

        require(!_hasRedeemed, "Address can only redeem once.");

        TuffVBT tuffVBT = TuffVBT(payable(address(this)));
        uint256 ownerBalance = tuffVBT.balanceOf(account);

        require(ownerBalance > 0, "Owner balance needs to be greater than 0.");

        uint256 redemptionAmount = getRedemptionAmount(ownerBalance);

        account.transfer(redemptionAmount);

        tuffVBT.burn(account, ownerBalance);

        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        ss.ownersRedeemed[account] = true;
        ss.ownersRedemptionBalances[account] = redemptionAmount;

        emit Redeemed(account, ownerBalance, redemptionAmount);
    }

    function hasRedeemed(address account) public view returns (bool, uint256) {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return (ss.ownersRedeemed[account], ss.ownersRedemptionBalances[account]);
    }

    function balanceOfEth(address account) public view returns (uint256) {
        return account.balance;
    }

    function getCurrentContractEthBalance() public view returns (uint256) {
        return address(this).balance;
    }

    //    call via perform upkeep once current timestamp >= contract maturity timestamp
    function onTokenMaturity() public onlyOwner {
        require(isTokenMatured(block.timestamp), "TUFF: Token must have reached maturity.");

        liquidateTreasury();

        if (!getIsTreasuryLiquidated()) {
            return;
        }

        uint256 ethBalance = getCurrentContractEthBalance();
        setContractStartingEthBalance(ethBalance);

        uint256 redeemableTotalSupply = TuffVBT(payable(address(this))).totalSupply();
        setTotalSupplyForRedemption(redeemableTotalSupply);

        emit TokenMatured(ethBalance, redeemableTotalSupply);
    }

    function liquidateTreasury() public onlyOwner {
        bool allAssetsLiquidated = true;

        if (!IAaveLPManager(address(this)).liquidateAaveTreasury()) {
            allAssetsLiquidated = false;
        }

        address[] memory supportedTokens = IAaveLPManager(address(this)).getAllAaveSupportedTokens();

        for (uint256 i = 0; i < supportedTokens.length; i++) {
            uint256 balance = IERC20(supportedTokens[i]).balanceOf(address(this));

            if (balance == 0) {
                continue;
            }

            if (swapForWETH(supportedTokens[i], balance) > 0) {
                allAssetsLiquidated = false;
            }
        }

        if (unwrapWETH() > 0) {
            allAssetsLiquidated = false;
        }

        if (allAssetsLiquidated) {
            setIsTreasuryLiquidated(true);
        }
    }

    //    swaps for WETH and returns new asset balance
    function swapForWETH(address token, uint256 amount) public onlyOwner returns (uint256) {
        UniswapManagerLib.StateStorage storage ss = UniswapManagerLib.getState();
        UniswapManager uniswapManager = UniswapManager(address(this));

        IERC20 erc20Token = IERC20(token);
        SafeERC20.safeApprove(erc20Token, address(this), amount);

        uniswapManager.swapExactInputSingle(
            token,
            ss.WETHAddress,
            ss.basePoolFee,
            amount,
            0 //TODO: fix, should be based on an orcale
        );

        return erc20Token.balanceOf(address(this));
    }

    //    unwraps WETH and returns remaining WETH balance
    function unwrapWETH() public onlyOwner returns (uint256) {
        UniswapManagerLib.StateStorage storage ss = UniswapManagerLib.getState();

        uint256 balance = IERC20(ss.WETHAddress).balanceOf(address(this));

        IWETH9(ss.WETHAddress).withdraw(balance);

        return IERC20(ss.WETHAddress).balanceOf(address(this));
    }
}
