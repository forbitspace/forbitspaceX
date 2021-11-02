// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.8;
pragma abicoder v2;

interface IforbitspaceX {
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

	event AggregateSwapped(address tokenIn, address tokenOut, uint amountIn, uint amountOut, address recipient);

	event FeeCollected(address indexed token, uint amount);

	event FeeToTransfered(address from, address to);

	function version() external pure returns (string memory);

	function ETH() external view returns (address);

	function WETH() external view returns (address);

	function feeTo() external view returns (address);

	function setFeeTo(address newFeeTo) external;

	function owner() external view returns (address);

	function renounceOwnership() external;

	function transferOwnership(address newOwner) external;

	function collectETH() external returns (uint amount);

	function collectTokens(address token) external returns (uint amount);

	function aggregate(AggregateParam calldata aParam)
		external
		payable
		returns (uint amountInAcutual, uint amountOutAcutual);
}
