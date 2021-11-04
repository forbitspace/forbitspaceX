// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.8;

interface IforbitspaceX {
	event FeeCollected(address indexed feeTo, address indexed token, uint amount);

	event FeeToTransfered(address indexed oldFeeTo, address indexed newFeeTo);

	event AggregateSwapped(
		address indexed recipient,
		address indexed tokenIn,
		address indexed tokenOut,
		uint amountIn,
		uint amountOut
	);

	struct AggregateParam {
		address tokenIn;
		address tokenOut;
		uint amountInTotal;
		address recipient;
		SwapParam[] sParams;
	}

	struct SwapParam {
		address addressToApprove;
		address exchangeTarget;
		address tokenIn; // tokenFrom
		address tokenOut; // tokenTo
		bytes swapData;
	}

	function version() external pure returns (string memory);

	function owner() external view returns (address);

	function feeTo() external view returns (address);

	function ETH() external view returns (address);

	function WETH() external view returns (address);

	function renounceOwnership() external;

	function transferOwnership(address newOwner) external;

	function setFeeTo(address newFeeTo) external;

	function collectETH() external returns (uint amount);

	function collectTokens(address token) external returns (uint amount);

	function aggregate(AggregateParam calldata aParam)
		external
		payable
		returns (uint amountInAcutual, uint amountOutAcutual);
}
