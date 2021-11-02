// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.8;

import { IStorageUpgradeable } from "./IStorageUpgradeable.sol";

interface IPayment is IStorageUpgradeable {
	event FeeCollected(address indexed token, uint amount);

	function collectETH() external returns (uint amount);

	function collectTokens(address token) external returns (uint amount);
}
