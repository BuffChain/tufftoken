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

/// @notice TokenMaturity contract is responsible for keeping track of the tokens life cycle and maturity.
/// The TuffKeeper contract makes calls to the isTokenMatured function regularly to determine if maturity has been
/// reached.  If it has, TuffKeeper will then make another call to onTokenMaturity which handles liquidating the TuffVBT
/// treasury into a redeemable asset
/* solhint-disable not-rely-on-time */
contract TokenMaturity {
    /// @dev functions with the onlyOwner modifier can only be called by the contract itself or the contract owner
    modifier onlyOwner() {
        TuffOwner(address(this)).requireOnlyOwner(msg.sender);
        _;
    }

    using SafeMath for uint256;

    /// Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    /// constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    /// @dev modifier onlyOwner can only be called by the contract itself or the contract owner
    /// @param daysUntilMaturity amount of days until the TuffVBT token instance reaches maturity and can be redeemed
    function initTokenMaturity(uint256 daysUntilMaturity) public onlyOwner {
        //TokenMaturity Already Initialized
        require(!isTokenMaturityInit(), "TMAI");

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

    /// @notice get the contracts maturity timestamp
    /// @return contractMaturityTimestamp
    function getContractMaturityTimestamp() public view returns (uint256) {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return ss.contractMaturityTimestamp;
    }

    /// @notice set the contracts maturity timestamp
    /// @dev modifier onlyOwner can only be called by the contract itself or the contract owner
    /// @param timestamp contract maturity timestamp
    function setContractMaturityTimestamp(uint256 timestamp) public onlyOwner {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        ss.contractMaturityTimestamp = timestamp;
    }

    /// @notice check if a timestamp is greater than or equal to contractMaturityTimestamp
    /// @param timestamp timestamp to check against contract maturity timestamp
    /// @return bool is matured
    function isTokenMatured(uint256 timestamp) public view returns (bool) {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return timestamp >= ss.contractMaturityTimestamp;
    }

    /// @notice returns the total amount of VBT supply at the time of maturity
    /// @return total VBT supply
    function totalSupplyForRedemption() public view returns (uint256) {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return ss.totalSupplyForRedemption;
    }

    /// @notice set the total VBT supply upon token maturity
    /// @dev modifier onlyOwner can only be called by the contract itself or the contract owner
    /// @param _totalSupplyForRedemption total VBT supply
    function setTotalSupplyForRedemption(uint256 _totalSupplyForRedemption) public onlyOwner {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        ss.totalSupplyForRedemption = _totalSupplyForRedemption;
    }

    /// @notice gets the contract ETH balance at time of maturity
    /// @return startingEthBalance
    function getContractStartingEthBalance() public view returns (uint256) {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return ss.startingEthBalance;
    }

    /// @notice sets the contract ETH balance at time of maturity
    /// @dev modifier onlyOwner can only be called by the contract itself or the contract owner
    /// @param startingEthBalance eth balance at time of maturity
    function setContractStartingEthBalance(uint256 startingEthBalance) public onlyOwner {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        ss.startingEthBalance = startingEthBalance;
    }

    /**
     * @notice calculates the redemption amount in ETH given a VBT balance.
     *
     * Redemption Amount = Contract ETH balance at time of maturity * amount of VBT held / total VBT supply
     *
     * @param ownerBalance amount of VBT to calculate redemption amount for
     * @return redemption amount given VBT amount
     */
    function getRedemptionAmount(uint256 ownerBalance) public view returns (uint256) {
        if (ownerBalance == 0) {
            return 0;
        }
        return getContractStartingEthBalance().mul(ownerBalance).div(totalSupplyForRedemption());
    }

    /// @notice checks to see if VBT treasury has been fully liquidated
    /// @return isTreasuryLiquidated
    function getIsTreasuryLiquidated() public view returns (bool) {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return ss.isTreasuryLiquidated;
    }

    /// @notice sets isTreasuryLiquidated when treasury has been fully liquidated
    /// @dev modifier onlyOwner can only be called by the contract itself or the contract owner
    /// @param _isTreasuryLiquidated bool is treasury liquidated
    function setIsTreasuryLiquidated(bool _isTreasuryLiquidated) public onlyOwner {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        ss.isTreasuryLiquidated = _isTreasuryLiquidated;
    }

    /**
     * @notice redemption function callable by VBT holder. Only redeemable once.
     *
     * calculates msg sender's VBT balance and redemption amount in ETH. Redemption amount is transferred to holder
     * and the msg sender's VBT balance is then burned.
     *
     * Emits a {Redeemed} event.
     *
     * Requirements:
     *
     * - VBT must have reached maturity
     * - VBT treasury must be fully liquidated
     * - msg sender (holder) must have not already redeemed
     * - msg sender (holder) must have a balance of VBT
     *
     */
    function redeem() public {
        //Redemption Before Expiration: Address can not redeem before expiration
        require(isTokenMatured(block.timestamp), "RBE");
        //Redemption Before Treasury Liquidation: Address can not redeem before treasury has been liquidated
        require(getIsTreasuryLiquidated(), "RBTL");

        address payable account = payable(msg.sender);

        (bool _hasRedeemed, ) = hasRedeemed(account);

        //Single Redemption: Address can only redeem once
        require(!_hasRedeemed, "SR");

        TuffVBT tuffVBT = TuffVBT(payable(address(this)));
        uint256 ownerBalance = tuffVBT.balanceOf(account);

        //OBGTZ: Owner balance needs to be greater than 0
        require(ownerBalance > 0, "OBGTZ");

        uint256 redemptionAmount = getRedemptionAmount(ownerBalance);

        account.transfer(redemptionAmount);

        tuffVBT.burn(account, ownerBalance);

        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        ss.ownersRedeemed[account] = true;
        ss.ownersRedemptionBalances[account] = redemptionAmount;

        emit Redeemed(account, ownerBalance, redemptionAmount);
    }

    /// @notice checks to see if an address has already redeemed
    /// @param account address to check if they have already redeemed
    /// @return bool has already redeemed
    /// @return amount redeemed
    function hasRedeemed(address account) public view returns (bool, uint256) {
        TokenMaturityLib.StateStorage storage ss = TokenMaturityLib.getState();
        return (ss.ownersRedeemed[account], ss.ownersRedemptionBalances[account]);
    }

    /// @notice address balance of ETH
    /// @return balance
    function balanceOfEth(address account) public view returns (uint256) {
        return account.balance;
    }

    /// @notice gets contracts current ETH balance
    /// @return balance
    function getCurrentContractEthBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice called via perform upkeep once current timestamp >= contract maturity timestamp
     *
     * @dev modifier onlyOwner can only be called by the contract itself or the contract owner
     *
     * - Liquidates VBT Treasury
     * - If treasury is fully liquidated, sets Starting Contract ETH balance to be used in redemption calculations
     * - If treasury is fully liquidated, Sets VBT total redeemable supply
     *
     * Emits a {TokenMatured} event. (if treasury is fully liquidated)
     *
     * Requirements:
     *
     * - VBT must have reached maturity
     *
     */
    function onTokenMaturity() public onlyOwner {
        //Not Matured: TUFF - Token must have reached maturity
        require(isTokenMatured(block.timestamp), "NM");

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

    /**
     * @notice function responsible for liquidating the VBT treasury.
     *
     * @dev modifier onlyOwner can only be called by the contract itself or the contract owner
     *
     * - Liquidates Aave Treasury
     * - For each VBT supported token, swap for WETH
     * - Unwrap WETH to ETH
     * - If all assets are liquidated, set isTreasuryLiquidated to true
     *
     */
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

    /// @notice swaps for WETH and returns new asset balance. Uses Uniswap to execute the swap.
    /// @dev modifier onlyOwner can only be called by the contract itself or the contract owner
    /// @param token token to swap for WETH
    /// @param amount amount of token to swamp
    /// @return contract's new token balance
    function swapForWETH(address token, uint256 amount) public onlyOwner returns (uint256) {
        UniswapManagerLib.StateStorage storage ss = UniswapManagerLib.getState();
        UniswapManager uniswapManager = UniswapManager(address(this));

        IERC20 erc20Token = IERC20(token);
        SafeERC20.safeApprove(erc20Token, address(this), amount);

        uniswapManager.swapExactInputSingle(
            token,
            ss.wethAddr,
            ss.basePoolFee,
            amount,
            0 //TODO: fix, should be based on an orcale
        );

        return erc20Token.balanceOf(address(this));
    }

    /// @notice unwraps WETH and returns remaining WETH balance.
    /// @dev modifier onlyOwner can only be called by the contract itself or the contract owner
    /// @return contract's WETH balance
    function unwrapWETH() public onlyOwner returns (uint256) {
        UniswapManagerLib.StateStorage storage ss = UniswapManagerLib.getState();

        uint256 balance = IERC20(ss.wethAddr).balanceOf(address(this));

        IWETH9(ss.wethAddr).withdraw(balance);

        return IERC20(ss.wethAddr).balanceOf(address(this));
    }
}
