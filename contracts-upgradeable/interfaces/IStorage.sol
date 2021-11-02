// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.8;

interface IStorage {
	event FeeToTransfered(address indexed oldFeeTo, address indexed newFeeTo);

	function setFeeTo(address newFeeTo) external;

	function feeTo() external view returns (address);

	function ETH() external view returns (address);

	function WETH() external view returns (address);
}
