// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;

interface IShell {
	function originSwap(
		address tokenFrom,
		address tokenTo,
		uint amountIn,
		uint amountOutMinimum,
		uint deadline
	) external returns (uint);
}
