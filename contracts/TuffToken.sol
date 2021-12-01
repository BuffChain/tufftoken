// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import {TuffTokenLib} from "./TuffTokenLib.sol";

contract TuffToken is Context, IERC20 {
    modifier tuffTokenInitLock() {
        require(isTuffTokenInit(), string(abi.encodePacked(TuffTokenLib.NAMESPACE, ": ", "UNINITIALIZED")));
        _;
    }

    //TODO: Is this needed?
    using SafeMath for uint256;
    using Address for address;

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initTuffToken(address initialOwner) public {
        require(!isTuffTokenInit(), string(abi.encodePacked(TuffTokenLib.NAMESPACE, ": ", "ALREADY_INITIALIZED")));

        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();

        ss.name = "TuffToken";
        ss.symbol = "TUFF";
        ss.decimals = 9;
        ss.farmFee = 10;
        ss.totalSupply = 1000000000 * 10 ** ss.decimals;

        //Set owner balancer and exclude from fees
        ss.balances[initialOwner] = ss.totalSupply;
        ss.isExcludedFromFee[initialOwner] = true;


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

    function totalSupply() public view override tuffTokenInitLock returns (uint256) {
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

    function balanceOf(address account) public view override tuffTokenInitLock returns (uint256) {
        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();
        return ss.balances[account];
    }

    function transfer(address recipient, uint256 amount) public override tuffTokenInitLock returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function allowance(address owner, address spender) public view override tuffTokenInitLock returns (uint256) {
        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();
        return ss.allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public override tuffTokenInitLock returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override tuffTokenInitLock returns (bool) {
        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();
        _transfer(sender, recipient, amount);
        _approve(sender, _msgSender(), ss.allowances[sender][_msgSender()].sub(amount, "ERC20: transfer amount exceeds allowance"));
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public virtual tuffTokenInitLock returns (bool) {
        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();
        _approve(_msgSender(), spender, ss.allowances[_msgSender()][spender].add(addedValue));
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual tuffTokenInitLock returns (bool) {
        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();
        _approve(_msgSender(), spender, ss.allowances[_msgSender()][spender].sub(subtractedValue, "ERC20: decreased allowance below zero"));
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

    function isExcludedFromFee(address account) public view tuffTokenInitLock returns (bool) {
        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();
        return ss.isExcludedFromFee[account];
    }

    function calculateFarmFee(uint256 _amount, bool takeFee) public view tuffTokenInitLock returns (uint256) {
        if (!takeFee) {
            return 0;
        }

        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();

        uint256 fee = _amount.mul(ss.farmFee).div(10 ** 2);
        //        require(fee > 0, "TUFF: Insufficient amount.");
        return fee;
    }

    function _approve(address owner, address spender, uint256 amount) private {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();

        ss.allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _transfer(address from, address to, uint256 amount) private {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(amount > 0, "Transfer amount must be greater than zero");
        require(balanceOf(from) >= amount, "Sender does not have adequate funds.");

        TuffTokenLib.StateStorage storage ss = TuffTokenLib.getState();

        //indicates if fee should be deducted from transfer
        bool takeFee = true;

        //if any account belongs to _isExcludedFromFee account then remove the fee
        if (ss.isExcludedFromFee[from] || ss.isExcludedFromFee[to]) {
            takeFee = false;
        }

        uint256 farmFeeAmount = calculateFarmFee(amount, takeFee);
        uint256 transferAmount = amount.sub(farmFeeAmount);

        ss.balances[from] = ss.balances[from].sub(amount);
        ss.balances[to] = ss.balances[to].add(transferAmount);

        ss.balances[address(this)] = ss.balances[address(this)].add(farmFeeAmount);

        emit Transfer(from, to, transferAmount);
        emit Transfer(from, address(this), farmFeeAmount);
    }

    receive() external payable {}
}
