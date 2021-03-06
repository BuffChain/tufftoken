// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import {TuffVBTLib} from "./TuffVBTLib.sol";
import "./TokenMaturity.sol";
import "./TuffOwner.sol";

/// @notice This contract is the implementation of a TuffVBT (volume bond token). It is an ERC20 token that takes fees
/// upon transfer to help build up the treasury.

contract TuffVBT is Context, IERC20 {
    /// @dev functions with the onlyOwner modifier can only be called by the contract itself or the contract owner
    modifier onlyOwner() {
        TuffOwner(address(this)).requireOnlyOwner(msg.sender);
        _;
    }

    using SafeMath for uint256;
    using Address for address;

    /// Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    /// constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    /// @dev modifier onlyOwner can only be called by the contract itself or the contract owner
    /// @param _initialOwner the initial owner of the contract
    /// @param _name name of the token
    /// @param _symbol symbol of the token
    /// @param _decimals decimals of the token
    /// @param _transferFee fee amount taken to build the treasury and send back to the DAO
    /// @param _daoFee fee amount sent to dev team for continued development work
    /// @param _daoWalletAddress address to send the collected dao fees
    /// @param _totalSupply total supply of the token
    function initTuffVBT(
        address _initialOwner,
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _transferFee,
        uint256 _daoFee,
        address _daoWalletAddress,
        uint256 _totalSupply
    ) public onlyOwner {
        //TuffVBT Already Initialized
        require(!isTuffVBTInit(), "TVAI");

        TuffVBTLib.StateStorage storage ss = TuffVBTLib.getState();

        ss.name = _name;
        ss.symbol = _symbol;
        ss.decimals = _decimals;
        ss.transferFee = _transferFee;
        ss.daoFee = _daoFee;
        ss.daoWalletAddress = _daoWalletAddress;
        ss.totalSupply = _totalSupply * 10**ss.decimals;

        //Set owner balancer and exclude from fees
        ss.balances[_initialOwner] = ss.totalSupply;
        ss.isExcludedFromFee[_initialOwner] = true;

        ss.isInit = true;
    }

    function isTuffVBTInit() public view returns (bool) {
        TuffVBTLib.StateStorage storage ss = TuffVBTLib.getState();
        return ss.isInit;
    }

    /// @notice returns the name of the token
    function name() public view returns (string memory) {
        TuffVBTLib.StateStorage storage ss = TuffVBTLib.getState();
        return ss.name;
    }

    /// @notice returns the symbol of the token
    function symbol() public view returns (string memory) {
        TuffVBTLib.StateStorage storage ss = TuffVBTLib.getState();
        return ss.symbol;
    }

    /// @notice returns the decimals of the token
    function decimals() public view returns (uint8) {
        TuffVBTLib.StateStorage storage ss = TuffVBTLib.getState();
        return ss.decimals;
    }

    /// @notice returns the total supply of the token
    function totalSupply() public view override returns (uint256) {
        TuffVBTLib.StateStorage storage ss = TuffVBTLib.getState();
        return ss.totalSupply;
    }

    /// @notice returns the transfer fee (total treasury & dao fees) of the token
    function getTransferFee() public view returns (uint256) {
        TuffVBTLib.StateStorage storage ss = TuffVBTLib.getState();
        return ss.transferFee;
    }

    /// @notice used by contract owner to set the transfer fee
    /// @dev modifier onlyOwner can only be called by the contract itself or the contract owner
    function setTransferFee(uint256 _transferFee) public onlyOwner {
        TuffVBTLib.StateStorage storage ss = TuffVBTLib.getState();
        ss.transferFee = _transferFee;
    }

    /// @notice returns the dao fee of the token
    function getDaoFee() public view returns (uint256) {
        TuffVBTLib.StateStorage storage ss = TuffVBTLib.getState();
        return ss.daoFee;
    }

    /// @notice used by contract owner to set the dao fee
    /// @dev modifier onlyOwner can only be called by the contract itself or the contract owner
    function setDaoFee(uint256 _daoFee) public onlyOwner {
        TuffVBTLib.StateStorage storage ss = TuffVBTLib.getState();
        ss.daoFee = _daoFee;
    }

    /// @notice returns the dao wallet address of the token
    function getDaoWalletAddress() public view returns (address) {
        TuffVBTLib.StateStorage storage ss = TuffVBTLib.getState();
        return ss.daoWalletAddress;
    }

    /// @notice used by contract owner to set the dao wallet address
    /// @dev modifier onlyOwner can only be called by the contract itself or the contract owner
    function setDaoWalletAddress(address _daoWalletAddress) public onlyOwner {
        TuffVBTLib.StateStorage storage ss = TuffVBTLib.getState();
        ss.daoWalletAddress = _daoWalletAddress;
    }

    /// @notice get the balance of an address
    /// @param account account to get the balance of
    /// @return returns the balance
    function balanceOf(address account) public view override returns (uint256) {
        TuffVBTLib.StateStorage storage ss = TuffVBTLib.getState();
        return ss.balances[account];
    }

    /// @notice transfer an amount of the TuffVBT to an account
    /// @param recipient recipient of the tokens from the msg sender
    /// @param amount amount of tokens being sent (before fees are taken)
    /// @return returns true if transfer is successful
    function transfer(address recipient, uint256 amount) public override returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    /// @notice get the allowance spender for a specified owner
    /// @param owner owner of the tokens
    /// @param spender spender of the owners tokens
    /// @return returns allowance
    function allowance(address owner, address spender) public view override returns (uint256) {
        TuffVBTLib.StateStorage storage ss = TuffVBTLib.getState();
        return ss.allowances[owner][spender];
    }

    /// @notice approve a holder to spend an amount
    /// @param spender address that will be granted to spend the specified amount
    /// @param amount amount granted to the spender to spend
    /// @return returns true if approval is successful
    function approve(address spender, uint256 amount) public override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    /**
     * @notice transfer from an account to another
     * @param from from address
     * @param to to address
     * @param amount amount to send
     * @return returns true if transfer is successful
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    /**
     * @dev Updates `owner` s allowance for `spender` based on spent `amount`.
     *
     * Does not update the allowance amount in case of infinite allowance.
     * Revert if not enough allowance is available.
     *
     * Might emit an {Approval} event.
     */
    function _spendAllowance(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            //Insufficient Allowance: ERC20 - insufficient allowance
            require(currentAllowance >= amount, "IA");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }

    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, allowance(owner, spender) + addedValue);
        return true;
    }

    /**
     * @dev Atomically decreases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `spender` must have allowance for the caller of at least
     * `subtractedValue`.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        address owner = _msgSender();
        uint256 currentAllowance = allowance(owner, spender);
        //Allowance Below Zero: ERC20 - decreased allowance below zero
        require(currentAllowance >= subtractedValue, "ABZ");
        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }

        return true;
    }

    /// @notice exclude an account from fees
    /// @dev modifier onlyOwner can only be called by the contract itself or the contract owner
    /// @param account the account to exclude
    function excludeFromFee(address account) public onlyOwner {
        TuffVBTLib.StateStorage storage ss = TuffVBTLib.getState();
        ss.isExcludedFromFee[account] = true;
    }

    /// @notice include an account in fees
    /// @dev modifier onlyOwner can only be called by the contract itself or the contract owner
    /// @param account the account to include
    function includeInFee(address account) public onlyOwner {
        TuffVBTLib.StateStorage storage ss = TuffVBTLib.getState();
        ss.isExcludedFromFee[account] = false;
    }

    /// @notice checks if an address is excluded from fees
    /// @dev modifier onlyOwner can only be called by the contract itself or the contract owner
    /// @param account the account to check if it is excluded
    function isExcludedFromFee(address account) public view onlyOwner returns (bool) {
        TuffVBTLib.StateStorage storage ss = TuffVBTLib.getState();
        return ss.isExcludedFromFee[account];
    }

    /// @notice helper to calculate fee
    /// @param _amount the base amount to calculate the fee amount from
    /// @param feePercent the fee percent to multiply by the base amount
    /// @param takeFee boolean override to have calculated fee be 0. Ex: account is excluded from fees
    /// @return calculated fee amount
    function calculateFee(
        uint256 _amount,
        uint256 feePercent,
        bool takeFee
    ) public pure returns (uint256) {
        if (!takeFee || feePercent == 0) {
            return 0;
        }
        uint256 fee = _amount.mul(feePercent).div(10**2);

        //Insufficient Amount
        require(fee > 0, "IA");
        return fee;
    }

    /**
     * @dev Sets `amount` as the allowance of `spender` over the `owner` s tokens.
     *
     * This internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     */
    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) private {
        //Approved From Zero Address: ERC20 - approve from the zero address
        require(owner != address(0), "AFZA");
        //Approved To Zero Address: ERC20 - approve to the zero address
        require(spender != address(0), "ATZA");

        TuffVBTLib.StateStorage storage ss = TuffVBTLib.getState();

        ss.allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    /**
     * @dev Moves `amount` of tokens from `sender` to `recipient`.
     *
     * This internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Fees will be taken unless the address is excluded or if the token has reached maturity.
     *
     * DAO fee is taken as a part of the total transfer fee, not it's own independent fee. In other words, the DAO fee
     * is a percentage of the transfer fee. If the transfer fee is 1%, and the DAO fee is 10%, 90% of the transfer fee
     * amount is sent to the treasury while the remaining 10% is sent to the DAO.
     *
     * Emits a {Transfer} event.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `from` must have a balance of at least `amount`.
     *
     * @param from from address
     * @param to to address
     * @param amount amount to send
     */
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {
        //Transfer From Zero Address: ERC20 - transfer from the zero address
        require(from != address(0), "TFZA");
        //Transfer To Zero Address: ERC20 - transfer to the zero address
        require(to != address(0), "TTZA");
        //Transfer Greater Than Zero: Transfer amount must be greater than zero
        require(amount > 0, "TGTZ");

        TuffVBTLib.StateStorage storage ss = TuffVBTLib.getState();

        uint256 fromBal = ss.balances[from];

        //Sender Missing Adequate Balance: Transfer amount must be greater than zero
        require(fromBal >= amount, "SMAB");

        //indicates if fee should be deducted from transfer
        bool takeFee = true;

        //if any account belongs to _isExcludedFromFee account then remove the fee
        if (ss.isExcludedFromFee[from] || ss.isExcludedFromFee[to]) {
            takeFee = false;
        }

        TokenMaturity tokenMaturity = TokenMaturity(address(this));
        // solhint-disable-next-line not-rely-on-time
        if (takeFee && tokenMaturity.isTokenMatured(block.timestamp)) {
            takeFee = false;
        }

        uint256 transferFeeAmount = calculateFee(amount, ss.transferFee, takeFee);
        uint256 treasuryFeeAmount = transferFeeAmount;
        uint256 daoFeeAmount = 0;
        if (ss.daoFee != 0) {
            // takes the dao fee from the transfer fee amount
            daoFeeAmount = calculateFee(transferFeeAmount, ss.daoFee, takeFee);
            treasuryFeeAmount = treasuryFeeAmount.sub(daoFeeAmount);
        }

        uint256 transferAmount = amount.sub(transferFeeAmount);

        ss.balances[from] = fromBal.sub(amount);
        ss.balances[to] = ss.balances[to].add(transferAmount);

        ss.balances[address(this)] = ss.balances[address(this)].add(treasuryFeeAmount);

        emit Transfer(from, to, transferAmount);
        emit Transfer(from, address(this), treasuryFeeAmount);

        if (daoFeeAmount != 0 && ss.daoWalletAddress != address(0)) {
            ss.balances[ss.daoWalletAddress] = ss.balances[ss.daoWalletAddress].add(daoFeeAmount);
            emit Transfer(from, ss.daoWalletAddress, daoFeeAmount);
        }
    }

    /**
     * @notice used by the contract itself post token maturity when a holder redeems their VBT.
     *
     * @dev modifier onlyOwner can only be called by the contract itself or the contract owner
     *
     * Emits a {Transfer} event.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - balance of `account` must have a sufficient amount for the burn.
     *
     * @param account the account that will have the amount burned.
     * @param amount the amount of the asset to be burned.
     *
     */

    function burn(address account, uint256 amount) public onlyOwner {
        //Burn From Zero Address: ERC20 - burn from the zero address
        require(account != address(0), "BFZA");

        TuffVBTLib.StateStorage storage ss = TuffVBTLib.getState();

        uint256 accountBalance = ss.balances[account];
        //Burn Amount Exceeds Balance: ERC20 - burn amount exceeds balance
        require(accountBalance >= amount, "BAEB");
        unchecked {
            ss.balances[account] = accountBalance - amount;
        }
        ss.totalSupply -= amount;

        emit Transfer(account, address(0), amount);
    }

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}
}
