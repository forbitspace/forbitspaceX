// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.8;

interface IforbitspaceX {
	event AggregateSwapped(
		address indexed recipient,
		address indexed tokenIn,
		address indexed tokenOut,
		uint amountIn,
		uint amountOut
	);

	struct AggregateParam {
		address tokenIn;
		address tokenOut;
		uint amountInTotal;
		address recipient;
		SwapParam[] sParams;
	}

	struct SwapParam {
		address addressToApprove;
		address exchangeTarget;
		address tokenIn; // tokenFrom
		address tokenOut; // tokenTo
		bytes swapData;
	}

	function version() external pure returns (string memory);

	function aggregate(AggregateParam calldata aParam)
		external
		payable
		returns (uint amountInAcutual, uint amountOutAcutual);
}
