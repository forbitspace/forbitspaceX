// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;

interface ISaddle {
	function swap(
		uint i,
		uint j,
		uint amountIn,
		uint amountOutMinimum,
		uint deadline
	) external returns (uint);
}
