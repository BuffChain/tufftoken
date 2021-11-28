// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts-v6/access/Ownable.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";

import {UniswapPoolDeployerLib} from "./UniswapPoolDeployerLib.sol";

//TODO: Remove ownable since this is a facet
contract UniswapPoolDeployer {
    modifier uniswapPoolDeployerInitLock() {
        require(isUniswapPoolDeployerInit(), string(abi.encodePacked(UniswapPoolDeployerLib.NAMESPACE, ": ", "UNINITIALIZED")));
        _;
    }

    function isUniswapPoolDeployerInit() public view returns (bool) {
        UniswapPoolDeployerLib.StateStorage storage ss = UniswapPoolDeployerLib.getState();
        return ss.isInit;
    }

    //Basically a constructor, but the hardhat-deploy plugin does not support diamond contracts with facets that has
    // constructors. We imitate a constructor with a one-time only function. This is called immediately after deployment
    function initUniswapPoolDeployer(address _tokenA, address _tokenB, uint24 _fee) public {
        require(!isUniswapPoolDeployerInit(), string(abi.encodePacked(UniswapPoolDeployerLib.NAMESPACE, ": ", "ALREADY_INITIALIZED")));

        UniswapPoolDeployerLib.StateStorage storage ss = UniswapPoolDeployerLib.getState();

        ss.factoryAddr = address(0x1F98431c8aD98523631AE4a59f267346ea31F984);

        setPool(_tokenA, _tokenB, _fee);
    }

    function setPool(address _tokenA, address _tokenB, uint24 _fee) public {
        UniswapPoolDeployerLib.StateStorage storage ss = UniswapPoolDeployerLib.getState();

        address _poolAddress = getPoolAddress(_tokenA, _tokenB, _fee);
        if (_poolAddress == address(0)) {
            IUniswapV3Factory(ss.factoryAddr).createPool(_tokenA, _tokenB, _fee);

            //TODO: what is the purpose of _poolAddress here? Is this supposed to be a class variable?
            _poolAddress = getPoolAddress(_tokenA, _tokenB, _fee);
        }

        ss.tokenA = _tokenA;
        ss.tokenB = _tokenB;
        ss.fee = _fee;
    }

    function getPoolAddress(address _tokenA, address _tokenB, uint24 _fee) public view returns (address) {
        UniswapPoolDeployerLib.StateStorage storage ss = UniswapPoolDeployerLib.getState();
        return IUniswapV3Factory(ss.factoryAddr).getPool(_tokenA, _tokenB, _fee);
    }
}
