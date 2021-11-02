// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.8;

import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { IStorageUpgradeable } from "../interfaces/IStorageUpgradeable.sol";

abstract contract StorageUpgradeable is IStorageUpgradeable, OwnableUpgradeable {
	address private _feeTo_;
	address private _WETH_;
	address private _ETH_;

	function initialize(address _WETH, address _feeTo) public initializer {
		__Ownable_init();
		setFeeTo(_feeTo);
		setWETH(_WETH);
		setETH(address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE));
	}

	function setETH(address _ETH) private initializer {
		require(_ETH != address(0), "Z");
		_ETH_ = _ETH;
	}

	function setWETH(address _WETH) private initializer {
		require(_WETH != address(0), "Z");
		_WETH_ = _WETH;
	}

	function setFeeTo(address _feeTo) public override onlyOwner {
		address newFeeTo = _feeTo == address(0) ? owner() : _feeTo;
		address oldFeeTo = _feeTo_;
		_feeTo_ = newFeeTo;
		emit FeeToTransfered(oldFeeTo, newFeeTo);
	}

	function ETH() public view override returns (address) {
		return _ETH_;
	}

	function WETH() public view override returns (address) {
		return _WETH_;
	}

	function feeTo() public view override returns (address) {
		return _feeTo_;
	}

	function version() public pure virtual override returns (string memory) {
		return "2.0.0";
	}
}
