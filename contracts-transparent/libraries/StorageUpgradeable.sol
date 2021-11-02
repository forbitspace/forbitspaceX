// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.8;

import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

abstract contract StorageUpgradeable is OwnableUpgradeable, UUPSUpgradeable {
	address private _feeTo;
	address private _WETH;
	address private _ETH;

	event FeeToTransfered(address from, address to);

	function initialize(address newWETH) public initializer {
		__Ownable_init();
		setFeeTo(owner());
		setWETH(newWETH);
		setETH(address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE));
	}

	function _authorizeUpgrade(address newImplementation) internal virtual override {}

	function version() public pure virtual returns (string memory) {
		return "1.0.0";
	}

	function ETH() public view returns (address) {
		return _ETH;
	}

	function WETH() public view returns (address) {
		return _WETH;
	}

	function feeTo() public view returns (address) {
		return _feeTo;
	}

	function setETH(address newETH) private {
		_ETH = newETH;
	}

	function setWETH(address newWETH) private {
		_WETH = newWETH;
	}

	function setFeeTo(address newFeeTo) public onlyOwner {
		require(newFeeTo != address(0), "Z"); // zero-address
		address oldFeeTo = _feeTo;
		_feeTo = newFeeTo;
		emit FeeToTransfered(oldFeeTo, newFeeTo);
	}
}
