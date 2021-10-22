// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;

interface IBalancer {
	struct Swap {
		address pool;
		uint tokenInParam; // tokenInAmount / maxAmountIn / limitAmountIn
		uint tokenOutParam; // minAmountOut / tokenAmountOut / limitAmountOut
		uint maxPrice;
	}

	function batchSwapExactIn(
		Swap[] memory swaps,
		address tokenIn,
		address tokenOut,
		uint totalAmountIn,
		uint minTotalAmountOut
	) external returns (uint totalAmountOut);
}
