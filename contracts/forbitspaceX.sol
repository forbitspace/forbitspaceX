// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;
pragma abicoder v2;

import { IforbitspaceX, SwapParam } from "./interfaces/IforbitspaceX.sol";
import { Payment, SafeMath, Address } from "./libraries/Payment.sol";

contract forbitspaceX is IforbitspaceX, Payment {
	using SafeMath for uint;
	using Address for address;

	constructor(address _WETH) Payment(_WETH) {}

	function _swap(
		address tokenIn,
		address tokenOut,
		SwapParam[] memory params
	) private returns (uint[2][] memory retAmounts) {
		retAmounts = new uint[2][](params.length);
		if (tokenIn == address(0)) tokenIn = WETH_;
		if (tokenOut == address(0)) tokenOut = WETH_;
		for (uint i = 0; i < params.length; i++) {
			uint amountIn = balanceOf(tokenIn); // amountIn before
			uint amountOut = balanceOf(tokenOut); // amountOut before
			params[i].target.functionCall(params[i].swapData, "C_S_F"); // call swap failed
			amountIn = amountIn.sub(balanceOf(tokenIn)); // amountIn after
			amountOut = balanceOf(tokenOut).sub(amountOut); // amountOut after
			retAmounts[i] = [amountIn, amountOut];
		}
	}

	function aggregate(
		address tokenIn,
		address tokenOut,
		uint amountTotal,
		SwapParam[] memory params
	)
		public
		payable
		override
		returns (
			uint amountInTotal,
			uint amountOutTotal,
			uint[2][] memory retAmounts
		)
	{
		// invalid tokens address
		require(!(tokenIn == tokenOut), "I_T_A");
		require(!(tokenIn == address(0) && tokenOut == WETH_), "I_T_A");
		require(!(tokenIn == WETH_ && tokenOut == address(0)), "I_T_A");

		// invalid value
		if (tokenIn == address(0)) require((amountTotal = msg.value) > 0, "I_V");
		else require(msg.value == 0, "I_V");

		pay(tokenIn, amountTotal);
		amountInTotal = balanceOf(tokenIn); // amountInTotal before
		amountOutTotal = balanceOf(tokenOut); // amountOutTotal before
		retAmounts = _swap(tokenIn, tokenOut, params); // call dex swaps
		amountInTotal = amountInTotal.sub(balanceOf(tokenIn)); // amountInTotal after
		amountOutTotal = balanceOf(tokenOut).sub(amountOutTotal); // amountOutTotal after
		refund(tokenIn, amountTotal.sub(amountInTotal.mul(2000).div(1999), "N_E_T")); // not enough tokens with 0.05% fee
		refund(tokenOut, amountOutTotal);
		collectTokens(tokenIn);
	}
}
