// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;

interface ISmoothy {
	function swap(
		uint i,
		uint j,
		uint amountIn,
		uint amountOutMin
	) external returns (uint amount);
}
