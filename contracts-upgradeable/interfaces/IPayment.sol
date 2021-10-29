// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.8;

import { IStorage } from "./IStorage.sol";

interface IPayment is IStorage {
	event FeeCollected(address token, uint amount);

	function collectETH() external returns (uint amount);

	function collectTokens(address token) external returns (uint amount);
}
