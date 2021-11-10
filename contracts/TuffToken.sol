// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract TuffToken is Context, IERC20 {
    uint256 private _isTuffTokenInitialized;

    modifier tuffTokenInitializerLock() {
        require(isTuffTokenInitialized() == 1, 'TUFF: UNINITIALIZED');
        _;
    }

    using SafeMath for uint256;
    using Address for address;

    mapping (address => uint256) private balances;
    mapping (address => mapping (address => uint256)) private _allowances;
    mapping (address => bool) private _isExcludedFromFee;

    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public farmFee;
    uint256 private _totalSupply;

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initTuffToken(address initialOwner) public {
        require(isTuffTokenInitialized() == 0, 'TUFF: ALREADY_INITIALIZED');

        name = "TuffToken";
        symbol = "TUFF";
        decimals = 9;
        farmFee = 10;
        _totalSupply = 1000000000 * 10 ** decimals;

        //exclude owner and this contract from fee
        _isExcludedFromFee[initialOwner] = true;
        _isExcludedFromFee[address(this)] = true;

        _isTuffTokenInitialized = 1;
    }

    function isTuffTokenInitialized() public view returns (uint256) {
        return _isTuffTokenInitialized;
    }

    function getFarmFee() public view tuffTokenInitializerLock returns (uint256) {
        return farmFee;
    }

    function setFarmFee(uint256 _farmFee) public tuffTokenInitializerLock {
        farmFee = _farmFee;
    }

    function balanceOf(address account) public view override tuffTokenInitializerLock returns (uint256) {
        return balances[account];
    }

    function transfer(address recipient, uint256 amount) public override tuffTokenInitializerLock returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function totalSupply() external view override tuffTokenInitializerLock returns (uint256) {
        return _totalSupply;
    }

    function allowance(address owner, address spender) public view override tuffTokenInitializerLock returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public override tuffTokenInitializerLock returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override tuffTokenInitializerLock returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(sender, _msgSender(), _allowances[sender][_msgSender()].sub(amount, "ERC20: transfer amount exceeds allowance"));
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public virtual tuffTokenInitializerLock returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].add(addedValue));
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].sub(subtractedValue, "ERC20: decreased allowance below zero"));
        return true;
    }

    function excludeFromFee(address account) public {
        _isExcludedFromFee[account] = true;
    }

    function includeInFee(address account) public {
        _isExcludedFromFee[account] = false;
    }

    receive() external payable {}

    function isExcludedFromFee(address account) public view returns(bool) {
        return _isExcludedFromFee[account];
    }

    function _approve(address owner, address spender, uint256 amount) private {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) private {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(amount > 0, "Transfer amount must be greater than zero");
        require(balanceOf(from) >= amount, "Sender does not have adequate funds.");

        //indicates if fee should be deducted from transfer
        bool takeFee = true;

        //if any account belongs to _isExcludedFromFee account then remove the fee
        if(_isExcludedFromFee[from] || _isExcludedFromFee[to]){
            takeFee = false;
        }

        uint256 farmFeeAmount = calculateFarmFee(amount, takeFee);
        uint256 transferAmount = amount.sub(farmFeeAmount);

        balances[from] = balances[from].sub(amount);
        balances[to] = balances[to].add(transferAmount);

        balances[address(this)] = balances[address(this)].add(farmFeeAmount);

        emit Transfer(from, to, transferAmount);
        emit Transfer(from, address(this), farmFeeAmount);
    }

    function calculateFarmFee(uint256 _amount, bool takeFee) public view returns (uint256) {
        if (!takeFee) {
            return 0;
        }

        uint256 fee = _amount.mul(farmFee).div(10**2);
//        require(fee > 0, "TUFF: Insufficient amount.");
        return fee;
    }
}
