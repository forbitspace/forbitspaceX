// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.8;

import { IPayment } from "../interfaces/IPayment.sol";
import { IWETH, IERC20 } from "../interfaces/IWETH.sol";
import { SafeERC20, Address } from "./SafeERC20.sol";
import { SafeMath } from "./SafeMath.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

abstract contract Payment is IPayment, OwnableUpgradeable {
	using SafeMath for uint;
	using SafeERC20 for IERC20;

	address private _feeTo;
	address private _WETH;
	address private _ETH = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);

	receive() external payable {}

	function initialize(address newWETH) public virtual initializer {
		__Ownable_init();
		setFeeTo(owner());
		_WETH = newWETH;
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

	function approve(
		address addressToApprove,
		address token,
		uint amount
	) internal {
		if (IERC20(token).allowance(address(this), addressToApprove) < amount) {
			IERC20(token).safeApprove(addressToApprove, 0);
			IERC20(token).safeIncreaseAllowance(addressToApprove, type(uint).max);
		}
	}

	function balanceOf(address token) internal view returns (uint bal) {
		if (token == _ETH) {
			token = _WETH;
		}

		bal = IERC20(token).balanceOf(address(this));
	}

	function pay(
		address recipient,
		address token,
		uint amount
	) internal {
		if (amount > 0) {
			if (recipient == address(this)) {
				if (token == _ETH) {
					IWETH(_WETH).deposit{ value: amount }();
				} else {
					IERC20(token).safeTransferFrom(_msgSender(), address(this), amount);
				}
			} else {
				if (token == _ETH) {
					if (balanceOf(_WETH) > 0) IWETH(_WETH).withdraw(balanceOf(_WETH));
					Address.sendValue(payable(recipient), amount);
				} else {
					IERC20(token).safeTransfer(recipient, amount);
				}
			}
		}
	}

	function collectETH() public override returns (uint amount) {
		if (balanceOf(_WETH) > 0) {
			IWETH(_WETH).withdraw(balanceOf(_WETH));
		}

		if ((amount = address(this).balance) > 0) {
			Address.sendValue(payable(_feeTo), amount);
		}
	}

	function collectTokens(address token) public override returns (uint amount) {
		if (token == _ETH) {
			amount = collectETH();
		} else if ((amount = balanceOf(token)) > 0) {
			IERC20(token).safeTransfer(_feeTo, amount);
		}

		if (amount > 0) {
			emit FeeCollected(token, amount);
		}
	}
}
