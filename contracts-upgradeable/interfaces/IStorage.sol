// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.8;

interface IStorage {
	event FeeToTransfered(address from, address to);

	function version() external pure returns (string memory);

	function WETH() external view returns (address);

	function ETH() external view returns (address);

	function feeTo() external view returns (address);

	function setFeeTo(address newFeeTo) external;
}