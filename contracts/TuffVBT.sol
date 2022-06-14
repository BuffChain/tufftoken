// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import "./TokenMaturity.sol";
import "./TuffOwner.sol";
import {TuffVBTStorage, WithStorage} from "./LibStorage.sol";

contract TuffVBT is Context, IERC20, WithStorage {
    modifier onlyOwner() {
        TuffOwner(address(this)).requireOnlyOwner(msg.sender);
        _;
    }

    using SafeMath for uint256;
    using Address for address;

    function name() public view returns (string memory) {
        return tuffVBTStorage().name;
    }

    function symbol() public view returns (string memory) {
        return tuffVBTStorage().symbol;
    }

    function decimals() public view returns (uint8) {
        return tuffVBTStorage().decimals;
    }

    function totalSupply()
        public
        view
        override
        returns (uint256)
    {
        return tuffVBTStorage().totalSupply;
    }

    function getFarmFee() public view returns (uint256) {
        return tuffVBTStorage().farmFee;
    }

    function setFarmFee(uint256 _farmFee) public onlyOwner {
        tuffVBTStorage().farmFee = _farmFee;
    }

    function getDevFee() public view returns (uint256) {
        return tuffVBTStorage().devFee;
    }

    function setDevFee(uint256 _devFee) public onlyOwner {
        tuffVBTStorage().devFee = _devFee;
    }

    function getDevWalletAddress()
        public
        view
        returns (address)
    {
        return tuffVBTStorage().devWalletAddress;
    }

    function setDevWalletAddress(address _devWalletAddress)
        public
        onlyOwner
    {
        tuffVBTStorage().devWalletAddress = _devWalletAddress;
    }

    function balanceOf(address account)
        public
        view
        override
        returns (uint256)
    {
        return tuffVBTStorage().balances[account];
    }

    function transfer(address recipient, uint256 amount)
        public
        override
        returns (bool)
    {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function allowance(address owner, address spender)
        public
        view
        override
        returns (uint256)
    {
        return tuffVBTStorage().allowances[owner][spender];
    }

    function approve(address spender, uint256 amount)
        public
        override
        returns (bool)
    {
        _approve(_msgSender(), spender, amount);
        return true;
    }

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
            require(
                currentAllowance >= amount,
                "ERC20: insufficient allowance"
            );
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
    function increaseAllowance(address spender, uint256 addedValue)
        public
        virtual

        returns (bool)
    {
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
    function decreaseAllowance(address spender, uint256 subtractedValue)
        public
        virtual

        returns (bool)
    {
        address owner = _msgSender();
        uint256 currentAllowance = allowance(owner, spender);
        require(
            currentAllowance >= subtractedValue,
            "ERC20: decreased allowance below zero"
        );
        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }

        return true;
    }

    function excludeFromFee(address account) public onlyOwner {
        tuffVBTStorage().isExcludedFromFee[account] = true;
    }

    function includeInFee(address account) public onlyOwner {
        tuffVBTStorage().isExcludedFromFee[account] = false;
    }

    function isExcludedFromFee(address account)
        public
        view
        onlyOwner
        returns (bool)
    {
        return tuffVBTStorage().isExcludedFromFee[account];
    }

    function calculateFee(
        uint256 _amount,
        uint256 feePercent,
        bool takeFee
    ) public view returns (uint256) {
        if (!takeFee || feePercent == 0) {
            return 0;
        }
        uint256 fee = _amount.mul(feePercent).div(10**2);
        require(
            fee > 0,
            "Insufficient amount."
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

        tuffVBTStorage().allowances[owner][spender] = amount;
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

        TuffVBTStorage storage s = tuffVBTStorage();

        uint256 fromBal = s.balances[from];
        require(fromBal >= amount, "Sender does not have adequate funds.");

        //indicates if fee should be deducted from transfer
        bool takeFee = true;

        //if any account belongs to _isExcludedFromFee account then remove the fee
        if (s.isExcludedFromFee[from] || s.isExcludedFromFee[to]) {
            takeFee = false;
        }

        TokenMaturity tokenMaturity = TokenMaturity(address(this));
        if (takeFee && tokenMaturity.isTokenMatured(block.timestamp)) {
            takeFee = false;
        }

        uint256 farmFeeAmount = calculateFee(amount, s.farmFee, takeFee);

        uint256 devFeeAmount = 0;
        if (s.devFee != 0) {
            devFeeAmount = calculateFee(amount, s.devFee, takeFee);
        }

        uint256 totalFeeAmount = farmFeeAmount.add(devFeeAmount);
        uint256 transferAmount = amount.sub(totalFeeAmount);

        s.balances[from] = fromBal.sub(amount);
        s.balances[to] = s.balances[to].add(transferAmount);

        s.balances[address(this)] = s.balances[address(this)].add(
            farmFeeAmount
        );

        emit Transfer(from, to, transferAmount);
        emit Transfer(from, address(this), farmFeeAmount);

        if (devFeeAmount != 0) {
            s.balances[s.devWalletAddress] = s
                .balances[s.devWalletAddress]
                .add(devFeeAmount);
            emit Transfer(from, s.devWalletAddress, devFeeAmount);
        }
    }

    function burn(address account, uint256 amount)
        public
        onlyOwner
    {
        require(account != address(0), "ERC20: burn from the zero address");

        TuffVBTStorage storage s = tuffVBTStorage();

        uint256 accountBalance = s.balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            s.balances[account] = accountBalance - amount;
        }
        s.totalSupply -= amount;

        emit Transfer(account, address(0), amount);
    }

    receive() external payable {}
}
