// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import {TuffTokenLib} from "./TuffTokenLib.sol";
import "./TokenMaturity.sol";

contract TuffToken is Context, IERC20 {
    modifier tuffTokenInitLock() {
        require(
            isTuffTokenInit(),
            string(
                abi.encodePacked(TuffTokenLib.NAMESPACE, ": ", "UNINITIALIZED")
            )
        );
        _;
    }

    using SafeMath for uint256;
    using Address for address;

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initTuffToken(
        address initialOwner,
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 farmFee,
        uint256 devFee,
        address devWalletAddress,
        uint256 totalSupply
    ) public {
        require(
            !isTuffTokenInit(),
            string(
                abi.encodePacked(
                    TuffTokenLib.NAMESPACE,
                    ": ",
                    "ALREADY_INITIALIZED"
                )
            )
        );

        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();

        ss.name = name;
        ss.symbol = symbol;
        ss.decimals = decimals;
        ss.farmFee = farmFee;
        ss.devFee = devFee;
        ss.devWalletAddress = devWalletAddress;
        ss.totalSupply = totalSupply * 10**ss.decimals;

        //Set owner balancer and exclude from fees
        ss.balances[initialOwner] = ss.totalSupply;
        ss.isExcludedFromFee[initialOwner] = true;

        ss.isExcludedFromFee[address(this)] = true;

        ss.isInit = true;
    }

    function isTuffTokenInit() public view returns (bool) {
        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();
        return ss.isInit;
    }

    function name() public view tuffTokenInitLock returns (string memory) {
        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();
        return ss.name;
    }

    function symbol() public view tuffTokenInitLock returns (string memory) {
        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();
        return ss.symbol;
    }

    function decimals() public view tuffTokenInitLock returns (uint8) {
        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();
        return ss.decimals;
    }

    function totalSupply()
        public
        view
        override
        tuffTokenInitLock
        returns (uint256)
    {
        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();
        return ss.totalSupply;
    }

    function getFarmFee() public view tuffTokenInitLock returns (uint256) {
        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();
        return ss.farmFee;
    }

    function setFarmFee(uint256 _farmFee) public tuffTokenInitLock {
        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();
        ss.farmFee = _farmFee;
    }

    function getDevFee() public view tuffTokenInitLock returns (uint256) {
        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();
        return ss.devFee;
    }

    function setDevFee(uint256 _devFee) public tuffTokenInitLock {
        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();
        ss.devFee = _devFee;
    }

    function getDevWalletAddress()
        public
        view
        tuffTokenInitLock
        returns (address)
    {
        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();
        return ss.devWalletAddress;
    }

    function setDevWalletAddress(address _devWalletAddress)
        public
        tuffTokenInitLock
    {
        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();
        ss.devWalletAddress = _devWalletAddress;
    }

    function balanceOf(address account)
        public
        view
        override
        tuffTokenInitLock
        returns (uint256)
    {
        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();
        return ss.balances[account];
    }

    function transfer(address recipient, uint256 amount)
        public
        override
        tuffTokenInitLock
        returns (bool)
    {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function allowance(address owner, address spender)
        public
        view
        override
        tuffTokenInitLock
        returns (uint256)
    {
        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();
        return ss.allowances[owner][spender];
    }

    function approve(address spender, uint256 amount)
        public
        override
        tuffTokenInitLock
        returns (bool)
    {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override tuffTokenInitLock returns (bool) {
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
    ) internal virtual tuffTokenInitLock {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
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
    function increaseAllowance(address spender, uint256 addedValue) public virtual tuffTokenInitLock returns (bool) {
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
    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual tuffTokenInitLock returns (bool) {
        address owner = _msgSender();
        uint256 currentAllowance = allowance(owner, spender);
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }

        return true;
    }

    function excludeFromFee(address account) public tuffTokenInitLock {
        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();
        ss.isExcludedFromFee[account] = true;
    }

    function includeInFee(address account) public tuffTokenInitLock {
        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();
        ss.isExcludedFromFee[account] = false;
    }

    function isExcludedFromFee(address account)
        public
        view
        tuffTokenInitLock
        returns (bool)
    {
        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();
        return ss.isExcludedFromFee[account];
    }

    function calculateFee(
        uint256 _amount,
        uint256 feePercent,
        bool takeFee
    ) public view tuffTokenInitLock returns (uint256) {
        if (!takeFee || feePercent == 0) {
            return 0;
        }
        uint256 fee = _amount.mul(feePercent).div(10**2);
        require(
            fee > 0,
            string(
                abi.encodePacked(
                    TuffTokenLib.NAMESPACE,
                    ": ",
                    "Insufficient amount."
                )
            )
        );
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
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();

        ss.allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    /**
     * @dev Moves `amount` of tokens from `sender` to `recipient`.
     *
     * This internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a {Transfer} event.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `from` must have a balance of at least `amount`.
     */
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(amount > 0, "Transfer amount must be greater than zero");

        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();

        uint256 fromBal = ss.balances[from];
        require(
            fromBal >= amount,
            "Sender does not have adequate funds."
        );

        //indicates if fee should be deducted from transfer
        bool takeFee = true;

        //if any account belongs to _isExcludedFromFee account then remove the fee
        if (ss.isExcludedFromFee[from] || ss.isExcludedFromFee[to]) {
            takeFee = false;
        }

        TokenMaturity tokenMaturity = TokenMaturity(address(this));
        if (takeFee && tokenMaturity.isTokenMatured(block.timestamp)) {
            takeFee = false;
        }

        uint256 farmFeeAmount = calculateFee(amount, ss.farmFee, takeFee);

        uint256 devFeeAmount = 0;
        if (ss.devFee != 0) {
            devFeeAmount = calculateFee(amount, ss.devFee, takeFee);
        }

        uint256 totalFeeAmount = farmFeeAmount.add(devFeeAmount);
        uint256 transferAmount = amount.sub(totalFeeAmount);

        ss.balances[from] = fromBal.sub(amount);
        ss.balances[to] = ss.balances[to].add(transferAmount);

        ss.balances[address(this)] = ss.balances[address(this)].add(
            farmFeeAmount
        );

        emit Transfer(from, to, transferAmount);
        emit Transfer(from, address(this), farmFeeAmount);

        if (devFeeAmount != 0) {
            ss.balances[ss.devWalletAddress] = ss
                .balances[ss.devWalletAddress]
                .add(devFeeAmount);
            emit Transfer(from, ss.devWalletAddress, devFeeAmount);
        }
    }

    function burn(address account, uint256 amount) public tuffTokenInitLock {
        require(account != address(0), "ERC20: burn from the zero address");

        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();

        uint256 accountBalance = ss.balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            ss.balances[account] = accountBalance - amount;
        }
        ss.totalSupply -= amount;

        emit Transfer(account, address(0), amount);
    }

    receive() external payable {}
}
