// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.8;

import {
	SafeERC20Upgradeable,
	AddressUpgradeable,
	IERC20Upgradeable
} from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import { SafeMathUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import { IWETH } from "../interfaces/IWETH.sol";
import { StorageUpgradeable } from "./StorageUpgradeable.sol";
import { IPayment } from "../interfaces/IPayment.sol";

abstract contract Payment is IPayment, StorageUpgradeable {
	using SafeMathUpgradeable for uint;
	using SafeERC20Upgradeable for IERC20Upgradeable;

	receive() external payable {}

	function approve(
		address addressToApprove,
		address token,
		uint amount
	) internal {
		if (IERC20Upgradeable(token).allowance(address(this), addressToApprove) < amount) {
			IERC20Upgradeable(token).safeApprove(addressToApprove, 0);
			IERC20Upgradeable(token).safeIncreaseAllowance(addressToApprove, type(uint).max);
		}
	}

	function balanceOf(address token) internal view returns (uint bal) {
		bal = IERC20Upgradeable(token == ETH() ? WETH() : token).balanceOf(address(this));
	}

	function pay(
		address recipient,
		address token,
		uint amount
	) internal {
		if (amount > 0) {
			if (recipient == address(this)) {
				if (token == ETH()) {
					IWETH(WETH()).deposit{ value: amount }();
				} else {
					IERC20Upgradeable(token).safeTransferFrom(_msgSender(), address(this), amount);
				}
			} else {
				if (token == ETH()) {
					if (balanceOf(WETH()) > 0) {
						IWETH(WETH()).withdraw(balanceOf(WETH()));
					}
					AddressUpgradeable.sendValue(payable(recipient), amount);
				} else {
					IERC20Upgradeable(token).safeTransfer(recipient, amount);
				}
			}
		}
	}

	function collectETH() public override returns (uint amount) {
		if (balanceOf(WETH()) > 0) {
			IWETH(WETH()).withdraw(balanceOf(WETH()));
		}

		if ((amount = address(this).balance) > 0) {
			AddressUpgradeable.sendValue(payable(feeTo()), amount);
		}
	}

	function collectTokens(address token) public override returns (uint amount) {
		if (token == ETH()) {
			amount = collectETH();
		} else if ((amount = balanceOf(token)) > 0) {
			IERC20Upgradeable(token).safeTransfer(feeTo(), amount);
		}

		if (amount > 0) {
			emit FeeCollected(token, amount);
		}
	}
}
