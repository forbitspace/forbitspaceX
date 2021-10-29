// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.8;

import { IStorage } from "../interfaces/IStorage.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

abstract contract Storage is IStorage, OwnableUpgradeable, UUPSUpgradeable {
	address private _feeTo;
	address private _WETH;
	address private _ETH = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);

	receive() external payable {}

	function initialize(address newWETH) public virtual initializer {
		__Ownable_init();
		setFeeTo(owner());
		_WETH = newWETH;
	}

	function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

	function version() public pure virtual override returns (string memory) {
		return "1.0.0";
	}

	function WETH() public view override returns (address) {
		return _WETH;
	}

	function ETH() public view override returns (address) {
		return _ETH;
	}

	function feeTo() public view override returns (address) {
		return _feeTo;
	}

	function setFeeTo(address newFeeTo) public override onlyOwner {
		require(newFeeTo != address(0), "Z"); // zero-address
		address oldFeeTo = _feeTo;
		_feeTo = newFeeTo;
		emit FeeToTransfered(oldFeeTo, newFeeTo);
	}
}
