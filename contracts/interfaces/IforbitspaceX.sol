// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;
pragma abicoder v2;

import { IPayment } from "./IPayment.sol";

struct SwapParam {
	address target;
	bytes swapData;
}

interface IforbitspaceX is IPayment {
	function aggregate(
		address tokenIn,
		address tokenOut,
		uint amountTotal,
		SwapParam[] memory params
	)
		external
		payable
		returns (
			uint amountInTotal,
			uint amountOutTotal,
			uint[2][] memory retAmounts
		);
}
