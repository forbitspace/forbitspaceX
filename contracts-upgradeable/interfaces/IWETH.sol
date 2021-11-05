// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.8;

import { IERC20 } from "./IERC20.sol";

interface IWETH is IERC20 {
	/// @notice Deposit ether to get wrapped ether
	function deposit() external payable;

	/// @notice Withdraw wrapped ether to get ether
	function withdraw(uint) external;
}
