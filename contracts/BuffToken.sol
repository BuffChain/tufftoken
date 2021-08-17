// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import { TransactionFeeManager } from  "./TransactionFeeManager.sol";
import { FarmTreasury } from  "./FarmTreasury.sol";

contract BuffToken is Context, IERC20, Ownable {
    using SafeMath for uint256;
    using Address for address;

    // tokens owned with respect to total reflections
    mapping (address => uint256) private _rOwned;

    // tokens owned
    mapping (address => uint256) private _tOwned;
    mapping (address => mapping (address => uint256)) private _allowances;

    mapping (address => bool) private _isExcludedFromFee;

    mapping (address => bool) private _isExcluded;
    address[] private _excluded;

    uint256 private constant MAX = ~uint256(0);

    // _tTotal = total tokens
    uint256 private _tTotal = 1000000000 * 10**9;

    // _rTotal =  total reflections
    uint256 private _rTotal = (MAX - (MAX % _tTotal));
    uint256 private _tFeeTotal;

    string private _name = "BuffToken";
    string private _symbol = "BUFF";
    uint8 private _decimals = 9;

    TransactionFeeManager transactionFeeManager;
    FarmTreasury farmTreasury;

    constructor(address _transactionFeeManagerAddr, address _farmTreasuryAddr) {
        transactionFeeManager = TransactionFeeManager(_transactionFeeManagerAddr);
        farmTreasury = FarmTreasury(_farmTreasuryAddr);

        _rOwned[_msgSender()] = _rTotal;

        //exclude owner and this contract from fee
        _isExcludedFromFee[owner()] = true;
        _isExcludedFromFee[address(this)] = true;

        emit Transfer(address(0), _msgSender(), _tTotal);
    }

    function setTransactionManager(address _transactionFeeManagerAddr) public onlyOwner {
        transactionFeeManager = TransactionFeeManager(_transactionFeeManagerAddr);
    }

    function setFarmTreasury(address _farmTreasuryAddr) public onlyOwner {
        farmTreasury = FarmTreasury(_farmTreasuryAddr);
    }

    function getTransactionManagerAddr() public view onlyOwner returns (address) {
        return address(transactionFeeManager);
    }

    function getFarmTreasuryAddr() public view onlyOwner returns (address) {
        return address(farmTreasury);
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

    function totalSupply() public view override returns (uint256) {
        return _tTotal;
    }

    function balanceOf(address account) public view override returns (uint256) {
        if (_isExcluded[account]) return _tOwned[account];
        return tokenFromReflection(_rOwned[account]);
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
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

    function isExcludedFromReward(address account) public view returns (bool) {
        return _isExcluded[account];
    }

    function totalFees() public view returns (uint256) {
        return _tFeeTotal;
    }

    function deliver(uint256 tAmount) public {
        address sender = _msgSender();
        require(!_isExcluded[sender], "Excluded addresses cannot call this function");
        (uint256 rAmount,,,,,) = _getValues(tAmount, true);
        _rOwned[sender] = _rOwned[sender].sub(rAmount);
        _rTotal = _rTotal.sub(rAmount);
        _tFeeTotal = _tFeeTotal.add(tAmount);
    }

    function reflectionFromToken(uint256 tAmount, bool deductTransferFee) public view returns (uint256) {
        require(tAmount <= _tTotal, "Amount must be less than supply");
        if (!deductTransferFee) {
            (uint256 rAmount,,,,,) = _getValues(tAmount, true);
            return rAmount;
        } else {
            (,uint256 rTransferAmount,,,,) = _getValues(tAmount, true);
            return rTransferAmount;
        }
    }

    function tokenFromReflection(uint256 rAmount) public view returns (uint256) {
        require(rAmount <= _rTotal, "Amount must be less than total reflections");
        uint256 currentRate =  _getRate();
        return rAmount.div(currentRate);
    }

    function excludeFromReward(address account) public onlyOwner() {
        require(!_isExcluded[account], "Account is already excluded");
        if(_rOwned[account] > 0) {
            _tOwned[account] = tokenFromReflection(_rOwned[account]);
        }
        _isExcluded[account] = true;
        _excluded.push(account);
    }

    function includeInReward(address account) external onlyOwner() {
        require(_isExcluded[account], "Account is already excluded");
        for (uint256 i = 0; i < _excluded.length; i++) {
            if (_excluded[i] == account) {
                _excluded[i] = _excluded[_excluded.length - 1];
                _tOwned[account] = 0;
                _isExcluded[account] = false;
                _excluded.pop();
                break;
            }
        }
    }

    function excludeFromFee(address account) public onlyOwner {
        _isExcludedFromFee[account] = true;
    }

    function includeInFee(address account) public onlyOwner {
        _isExcludedFromFee[account] = false;
    }

    //to recieve ETH from uniswapV2Router when swaping
    receive() external payable {}


    // decreasing _rTotal increases the value of tokens
    function _reflectFee(uint256 rReflectionFeeAmount, uint256 tReflectionFeeAmount) private {
        _rTotal = _rTotal.sub(rReflectionFeeAmount);
        _tFeeTotal = _tFeeTotal.add(tReflectionFeeAmount);
    }

    function _getValues(uint256 tAmount, bool takeFee) private view returns (uint256, uint256, uint256, uint256, uint256, uint256) {
        (uint256 tTransferAmount, uint256 tReflectionFeeAmount, uint256 tFarmFeeAmount) = _getTValues(tAmount, takeFee);
        (uint256 rAmount, uint256 rTransferAmount, uint256 rReflectionFeeAmount) = _getRValues(tAmount, tReflectionFeeAmount, tFarmFeeAmount, _getRate());
        return (rAmount, rTransferAmount, rReflectionFeeAmount, tTransferAmount, tReflectionFeeAmount, tFarmFeeAmount);
    }

    function _getTValues(uint256 tAmount, bool takeFee) private view returns (uint256, uint256, uint256) {
        uint256 tReflectionFeeAmount = calculateReflectionFee(tAmount, takeFee);
        uint256 tFarmFeeAmount = calculateFarmFee(tAmount, takeFee);
        uint256 tTransferAmount = tAmount.sub(tReflectionFeeAmount).sub(tFarmFeeAmount);
        return (tTransferAmount, tReflectionFeeAmount, tFarmFeeAmount);
    }

    function _getRValues(uint256 tAmount, uint256 tReflectionFeeAmount, uint256 tFarmFeeAmount, uint256 currentRate) private pure returns (uint256, uint256, uint256) {
        uint256 rAmount = tAmount.mul(currentRate);
        uint256 rReflectionFee = tReflectionFeeAmount.mul(currentRate);
        uint256 rFarmFee = tFarmFeeAmount.mul(currentRate);
        uint256 rTransferAmount = rAmount.sub(rReflectionFee).sub(rFarmFee);
        return (rAmount, rTransferAmount, rReflectionFee);
    }

    function _getRate() private view returns(uint256) {
        (uint256 rSupply, uint256 tSupply) = _getCurrentSupply();
        return rSupply.div(tSupply);
    }

    function _getCurrentSupply() private view returns(uint256, uint256) {
        uint256 rSupply = _rTotal;
        uint256 tSupply = _tTotal;
        for (uint256 i = 0; i < _excluded.length; i++) {
            if (_rOwned[_excluded[i]] > rSupply || _tOwned[_excluded[i]] > tSupply) return (_rTotal, _tTotal);
            rSupply = rSupply.sub(_rOwned[_excluded[i]]);
            tSupply = tSupply.sub(_tOwned[_excluded[i]]);
        }
        if (rSupply < _rTotal.div(_tTotal)) return (_rTotal, _tTotal);
        return (rSupply, tSupply);
    }

    // send farm fee amount to farm treasury
    function _takeFarmFee(uint256 tFarmFeeAmount) private {
        address _farmTreasuryAddr = address(farmTreasury);
        uint256 currentRate =  _getRate();
        uint256 rFarmFeeAmount = tFarmFeeAmount.mul(currentRate);

        _rOwned[_farmTreasuryAddr] = _rOwned[_farmTreasuryAddr].add(rFarmFeeAmount);
        if (_isExcluded[_farmTreasuryAddr])
            _tOwned[_farmTreasuryAddr] = _tOwned[_farmTreasuryAddr].add(tFarmFeeAmount);
    }

    function calculateReflectionFee(uint256 _amount, bool takeFee) public view returns (uint256) {
        if (!takeFee) {
            return 0;
        }

        uint256 _fee = transactionFeeManager.getReflectionFee();
        return _amount.mul(_fee).div(10**2);
    }

    function calculateFarmFee(uint256 _amount, bool takeFee) public view returns (uint256) {
        if (!takeFee) {
            return 0;
        }

        uint256 _fee = transactionFeeManager.getFarmFee();
        return _amount.mul(_fee).div(10**2);
    }

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

        //indicates if fee should be deducted from transfer
        bool takeFee = true;

        //if any account belongs to _isExcludedFromFee account then remove the fee
        if(_isExcludedFromFee[from] || _isExcludedFromFee[to]){
            takeFee = false;
        }

        //transfer amount, it will take tax, burn, liquidity fee
        _tokenTransfer(from, to, amount, takeFee);
    }


    //this method is responsible for taking all fee, if takeFee is true
    function _tokenTransfer(address sender, address recipient, uint256 amount,bool takeFee) private {

        if (_isExcluded[sender] && !_isExcluded[recipient]) {
            _transferFromExcluded(sender, recipient, amount, takeFee);
        } else if (!_isExcluded[sender] && _isExcluded[recipient]) {
            _transferToExcluded(sender, recipient, amount, takeFee);
        } else if (!_isExcluded[sender] && !_isExcluded[recipient]) {
            _transferStandard(sender, recipient, amount, takeFee);
        } else if (_isExcluded[sender] && _isExcluded[recipient]) {
            _transferBothExcluded(sender, recipient, amount, takeFee);
        } else {
            _transferStandard(sender, recipient, amount, takeFee);
        }

    }

    function _transferStandard(address sender, address recipient, uint256 tAmount, bool takeFee) private {
        (uint256 rAmount, uint256 rTransferAmount, uint256 rReflectionFeeAmount, uint256 tTransferAmount, uint256 tReflectionFeeAmount, uint256 tFarmFeeAmount) = _getValues(tAmount, takeFee);

        //TODO: Make sure sender has enough to send
        _rOwned[sender] = _rOwned[sender].sub(rAmount);
        _rOwned[recipient] = _rOwned[recipient].add(rTransferAmount);
        _takeFarmFee(tFarmFeeAmount);
        _reflectFee(rReflectionFeeAmount, tReflectionFeeAmount);
        emit Transfer(sender, recipient, tTransferAmount);
    }

    function _transferToExcluded(address sender, address recipient, uint256 tAmount, bool takeFee) private {
        (uint256 rAmount, uint256 rTransferAmount, uint256 rReflectionFeeAmount, uint256 tTransferAmount, uint256 tReflectionFeeAmount, uint256 tFarmFeeAmount) = _getValues(tAmount, takeFee);
        _rOwned[sender] = _rOwned[sender].sub(rAmount);
        _tOwned[recipient] = _tOwned[recipient].add(tTransferAmount);
        _rOwned[recipient] = _rOwned[recipient].add(rTransferAmount);
        _takeFarmFee(tFarmFeeAmount);
        _reflectFee(rReflectionFeeAmount, tReflectionFeeAmount);
        emit Transfer(sender, recipient, tTransferAmount);
    }

    function _transferFromExcluded(address sender, address recipient, uint256 tAmount, bool takeFee) private {
        (uint256 rAmount, uint256 rTransferAmount, uint256 rReflectionFeeAmount, uint256 tTransferAmount, uint256 tReflectionFeeAmount, uint256 tFarmFeeAmount) = _getValues(tAmount, takeFee);
        _tOwned[sender] = _tOwned[sender].sub(tAmount);
        _rOwned[sender] = _rOwned[sender].sub(rAmount);
        _rOwned[recipient] = _rOwned[recipient].add(rTransferAmount);
        _takeFarmFee(tFarmFeeAmount);
        _reflectFee(rReflectionFeeAmount, tReflectionFeeAmount);
        emit Transfer(sender, recipient, tTransferAmount);
    }

    function _transferBothExcluded(address sender, address recipient, uint256 tAmount, bool takeFee) private {
        (uint256 rAmount, uint256 rTransferAmount, uint256 rReflectionFeeAmount, uint256 tTransferAmount, uint256 tReflectionFeeAmount, uint256 tFarmFeeAmount) = _getValues(tAmount, takeFee);
        _tOwned[sender] = _tOwned[sender].sub(tAmount);
        _rOwned[sender] = _rOwned[sender].sub(rAmount);
        _tOwned[recipient] = _tOwned[recipient].add(tTransferAmount);
        _rOwned[recipient] = _rOwned[recipient].add(rTransferAmount);
        _takeFarmFee(tFarmFeeAmount);
        _reflectFee(rReflectionFeeAmount, tReflectionFeeAmount);
        emit Transfer(sender, recipient, tTransferAmount);
    }

}

