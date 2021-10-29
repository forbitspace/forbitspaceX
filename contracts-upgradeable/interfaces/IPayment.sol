// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.8;

interface IPayment {
	event FeeCollected(address token, uint amount);

	event FeeToTransfered(address from, address to);

	function setFeeTo(address _feeTo) external;

	function collectETH() external returns (uint amount);

	function collectTokens(address token) external returns (uint amount);
}
