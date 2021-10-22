// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;

import { SafeERC20, IERC20, Address } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { SafeMath } from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IPayment } from "../interfaces/IPayment.sol";
import { IWETH } from "../interfaces/IWETH.sol";

abstract contract Payment is IPayment, Ownable {
	using SafeMath for uint;
	using SafeERC20 for IERC20;

	address public constant ETH_ADDRESS = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);

	address public immutable WETH_ADDRESS;

	receive() external payable {}

	constructor(address _WETH) {
		WETH_ADDRESS = _WETH;
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
		if (token == ETH_ADDRESS) {
			token = WETH_ADDRESS;
		}

		bal = IERC20(token).balanceOf(address(this));
	}

	function pay(address token, uint amount) internal {
		if (amount == 0) {
			revert("I_A"); // invalid amount
		}
		if (token == ETH_ADDRESS) {
			IWETH(WETH_ADDRESS).deposit{ value: amount.mul(1999).div(2000) }();
		} else {
			IERC20(token).safeTransferFrom(_msgSender(), address(this), amount);
		}
	}

	function refund(address token, uint amount) internal {
		if (amount == 0) {
			return;
		}

		if (token == ETH_ADDRESS) {
			if (balanceOf(WETH_ADDRESS) > 0) IWETH(WETH_ADDRESS).withdraw(balanceOf(WETH_ADDRESS));
			Address.sendValue(payable(_msgSender()), amount);
		} else {
			IERC20(token).safeTransfer(_msgSender(), amount);
		}
	}

	function collectETH() public override returns (uint amount) {
		if (balanceOf(WETH_ADDRESS) > 0) {
			IWETH(WETH_ADDRESS).withdraw(balanceOf(WETH_ADDRESS));
		}
		if ((amount = address(this).balance) > 0) {
			Address.sendValue(payable(owner()), amount);
		}
	}

	function collectTokens(address token) public override returns (uint amount) {
		if (token == ETH_ADDRESS) {
			amount = collectETH();
		} else if ((amount = balanceOf(token)) > 0) {
			IERC20(token).safeTransfer(owner(), amount);
		}
	}
}
