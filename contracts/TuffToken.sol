// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import { FarmTreasury } from  "./FarmTreasury.sol";

contract TuffToken is Context, IERC20, Ownable {

    using SafeMath for uint256;
    using Address for address;

    mapping (address => uint256) private balances;
    mapping (address => mapping (address => uint256)) private _allowances;
    mapping (address => bool) private _isExcludedFromFee;

    string public name = "TuffToken";
    string public symbol = "TUFF";
    uint8 public decimals = 9;
    uint256 public farmFee = 10;
    uint256 private _totalSupply = 1000000000 * 10 ** decimals;

    FarmTreasury farmTreasury;

    constructor(address initialOwner, address payable _farmTreasuryAddr) {
        transferOwnership(initialOwner);
        balances[owner()] = _totalSupply;
        emit Transfer(address(0), owner(), _totalSupply);

        //exclude owner and this contract from fee
        _isExcludedFromFee[owner()] = true;
        _isExcludedFromFee[address(this)] = true;

        farmTreasury = FarmTreasury(_farmTreasuryAddr);
    }

    function setFarmTreasury(address payable _farmTreasuryAddr) public onlyOwner {
        farmTreasury = FarmTreasury(_farmTreasuryAddr);
    }

    function getFarmTreasuryAddr() public view onlyOwner returns (address) {
        return address(farmTreasury);
    }

    function setFarmFee(uint256 _farmFee) public onlyOwner {
        farmFee = _farmFee;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return balances[account];
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function allowance(address owner, address spender) public view override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(sender, _msgSender(), _allowances[sender][_msgSender()].sub(amount, "ERC20: transfer amount exceeds allowance"));
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].add(addedValue));
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].sub(subtractedValue, "ERC20: decreased allowance below zero"));
        return true;
    }

    function excludeFromFee(address account) public onlyOwner {
        _isExcludedFromFee[account] = true;
    }

    function includeInFee(address account) public onlyOwner {
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

        address _farmTreasuryAddr = address(farmTreasury);
        balances[_farmTreasuryAddr] = balances[_farmTreasuryAddr].add(farmFeeAmount);

        emit Transfer(from, to, transferAmount);
        emit Transfer(from, _farmTreasuryAddr, farmFeeAmount);
    }

    function calculateFarmFee(uint256 _amount, bool takeFee) public view returns (uint256) {

        if (!takeFee) {
            return 0;
        }

        uint256 fee = _amount.mul(farmFee).div(10**2);
        require(fee > 0, "Insufficient amount.");
        return fee;
    }

}

