// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;

interface ImStable {
	// Mint
	function mint(
		address _input,
		uint _inputQuantity,
		uint _minOutputQuantity,
		address _recipient
	) external returns (uint mintOutput);

	// Swaps
	function swap(
		address _input,
		address _output,
		uint _inputQuantity,
		uint _minOutputQuantity,
		address _recipient
	) external returns (uint swapOutput);

	// Redemption
	function redeem(
		address _output,
		uint _mAssetQuantity,
		uint _minOutputQuantity,
		address _recipient
	) external returns (uint outputQuantity);
}
