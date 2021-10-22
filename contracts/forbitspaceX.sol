// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;
pragma abicoder v2;

import { IforbitspaceX } from "./interfaces/IforbitspaceX.sol";
import { Payment, SafeMath, Address } from "./libraries/Payment.sol";

contract forbitspaceX is IforbitspaceX, Payment {
	using SafeMath for uint;
	using Address for address;

	constructor(address _WETH) Payment(_WETH) {}

	function _swap(SwapParam[] memory params) private {
		for (uint i = 0; i < params.length; i++) {
			approve(params[i].addressToApprove, params[i].tokenIn, params[i].amountIn);

			uint amountIn = balanceOf(params[i].tokenIn); // amountIn before
			uint amountOut = balanceOf(params[i].tokenOut); // amountOut before

			params[i].exchangeTarget.functionCall(params[i].swapData, "C_S_F"); // call swap failed

			amountIn = amountIn.sub(balanceOf(params[i].tokenIn)); // amountIn after
			amountOut = balanceOf(params[i].tokenOut).sub(amountOut); // amountOut after

			require(amountOut >= params[i].amountOut, "I_O_A"); // INSUFFICIENT_OUTPUT_AMOUNT
		}
	}

	function aggregate(
		address tokenIn,
		address tokenOut,
		uint amountInTotal,
		uint amountOutTotal,
		SwapParam[] calldata params
	) public payable override returns (uint amountInAcutual, uint amountOutAcutual) {
		// invalid tokens address
		require(!(tokenIn == tokenOut), "I_T_A");
		require(!(tokenIn == ETH_ADDRESS && tokenOut == WETH_ADDRESS), "I_T_A");
		require(!(tokenIn == WETH_ADDRESS && tokenOut == ETH_ADDRESS), "I_T_A");

		// invalid value
		if (tokenIn == ETH_ADDRESS) require((amountInTotal = msg.value) > 0, "I_V");
		else require(msg.value == 0, "I_V");

		pay(tokenIn, amountInTotal);

		amountInAcutual = balanceOf(tokenIn); // amountInAcutual before
		amountOutAcutual = balanceOf(tokenOut); // amountOutAcutual before

		_swap(params); // call dex swaps

		amountInAcutual = amountInAcutual.sub(balanceOf(tokenIn)); // amountInAcutual after
		amountOutAcutual = balanceOf(tokenOut).sub(amountOutAcutual); // amountOutAcutual after

		require(amountOutAcutual >= amountOutTotal, "I_O_A"); // INSUFFICIENT_OUTPUT_AMOUNT

		refund(tokenIn, amountInTotal.sub(amountInAcutual.mul(2000).div(1999), "N_E_T")); // not enough tokens with 0.05% fee
		refund(tokenOut, amountOutAcutual);

		collectTokens(tokenIn);
	}
}
