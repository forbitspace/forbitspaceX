// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.8;

interface IWETH {
	/// @notice Deposit ether to get wrapped ether
	function deposit() external payable;

	/// @notice Withdraw wrapped ether to get ether
	function withdraw(uint) external;
}
