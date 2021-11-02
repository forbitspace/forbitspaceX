// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.8;

import { IPayment } from "./IPayment.sol";

interface IforbitspaceX is IPayment {
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

	event AggregateSwapped(
		uint amountIn,
		uint amountOut,
		address indexed tokenIn,
		address indexed tokenOut,
		address indexed recipient
	);

	function aggregate(AggregateParam calldata aParam)
		external
		payable
		returns (uint amountInAcutual, uint amountOutAcutual);
}
