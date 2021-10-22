// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;

interface ICurve {
	// exchange c-tokens
	function exchange(
		uint i,
		uint j,
		uint amountIn,
		uint amountOutMin
	) external returns (uint amount);

	// exchange tokens
	function exchange_underlying(
		uint i,
		uint j,
		uint amountIn,
		uint amountOutMin
	) external returns (uint amount);
}
