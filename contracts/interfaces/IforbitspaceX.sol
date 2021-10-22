// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;
pragma abicoder v2;

import { IPayment } from "./IPayment.sol";

interface IforbitspaceX is IPayment {
	struct SwapParam {
		address addressToApprove;
		address exchangeTarget;
		address tokenIn; // tokenFrom
		address tokenOut; // tokenTo
		uint amountIn; // amountInMax
		uint amountOut; // amountOutMin
		bytes swapData;
	}

	function aggregate(
		address tokenIn,
		address tokenOut,
		uint amountInTotal,
		uint amountOutTotal,
		SwapParam[] calldata params
	) external payable returns (uint amountInAcutual, uint amountOutAcutual);
}
