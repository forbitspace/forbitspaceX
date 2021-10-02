// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.8.0;
pragma abicoder v2;

import {Payment, SafeMath, Address} from './libraries/Payment.sol';

struct SwapParam {
	address target;
	bytes swapData;
}

contract forbitspaceX is Payment {
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
			params[i].target.functionCall(params[i].swapData, 'C_S_F'); // call swap failed
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
		returns (
			uint amountInTotal,
			uint amountOutTotal,
			uint[2][] memory retAmounts
		)
	{
		require(!(tokenIn == tokenOut), 'I_T_A'); // invalid tokens address
		require(!(tokenIn == WETH_ && tokenOut == address(0)), 'I_T_A');
		require(!(tokenOut == WETH_ && tokenIn == address(0)), 'I_T_A');

		if (tokenIn != address(0)) require(msg.value == 0, 'I_V');
		else require((amountTotal = msg.value) > 0, 'I_V'); // invalid value

		pay(tokenIn, amountTotal);
		amountInTotal = balanceOf(tokenIn); // amountInToTal before
		amountOutTotal = balanceOf(tokenOut); // amountOutToTal before
		retAmounts = _swap(tokenIn, tokenOut, params); // call swaps
		amountInTotal = amountInTotal.sub(balanceOf(tokenIn)); // amountInToTal after
		amountOutTotal = balanceOf(tokenOut).sub(amountOutTotal); // amountOutToTal after
		refund(tokenIn, amountTotal.sub(amountInTotal.mul(2000).div(1999))); // 0.05% fee
		refund(tokenOut, amountOutTotal);
		collectTokens(tokenIn);
	}
}
