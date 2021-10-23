// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;
pragma abicoder v2;

import { IforbitspaceX } from "./interfaces/IforbitspaceX.sol";
import { Payment, SafeMath, Address } from "./libraries/Payment.sol";

contract forbitspaceX is IforbitspaceX, Payment {
	using SafeMath for uint;
	using Address for address;

	constructor(address _WETH) Payment(_WETH) {}

	function aggregate(
		address tokenIn,
		address tokenOut,
		uint amountInTotal,
		address recipient,
		SwapParam[] calldata params
	) public payable override returns (uint amountInAcutual, uint amountOutAcutual) {
		// check invalid tokens address
		require(!(tokenIn == tokenOut), "I_T_A");
		require(!(tokenIn == ETH_ADDRESS && tokenOut == WETH_ADDRESS), "I_T_A");
		require(!(tokenIn == WETH_ADDRESS && tokenOut == ETH_ADDRESS), "I_T_A");

		// check invalid value
		if (tokenIn == ETH_ADDRESS) {
			amountInTotal = msg.value;
		} else {
			require(msg.value == 0, "I_V");
		}
		require(amountInTotal > 0, "I_V");

		pay(_msgSender(), address(this), tokenIn, amountInTotal);

		// amountAcutual before
		amountInAcutual = balanceOf(tokenIn);
		amountOutAcutual = balanceOf(tokenOut);

		// call swap on multi dexs
		_swap(params);

		// amountAcutual after
		amountInAcutual = amountInAcutual.sub(balanceOf(tokenIn));
		amountOutAcutual = balanceOf(tokenOut).sub(amountOutAcutual);

		pay(address(this), recipient, tokenIn, amountInTotal.sub(amountInAcutual, "E_I_T")); // EXCESSIVE_INPUT_AMOUNT
		pay(address(this), recipient, tokenOut, amountOutAcutual.mul(9995).div(10000)); // 0.05% fee

		// sweep token for owner
		collectTokens(tokenIn);
		collectTokens(tokenOut);
	}

	function _swap(SwapParam[] calldata params) private {
		for (uint i = 0; i < params.length; i++) {
			SwapParam calldata p = params[i];
			(
				address exchangeTarget,
				address addressToApprove,
				address tokenIn,
				address tokenOut,
				bytes calldata swapData
			) = (p.exchangeTarget, p.addressToApprove, p.tokenIn, p.tokenOut, p.swapData);

			approve(addressToApprove, tokenIn, type(uint).max);

			// amountActual before
			uint amountInActual = balanceOf(tokenIn);
			uint amountOutActual = balanceOf(tokenOut);

			exchangeTarget.functionCall(swapData, "C_S_F"); // call swap failed

			// amountActual after
			amountInActual = amountInActual.sub(balanceOf(tokenIn), "EXCESSIVE_INPUT_AMOUNT"); // EXCESSIVE_INPUT_AMOUNT
			amountOutActual = balanceOf(tokenOut).sub(amountOutActual, "INSUFFICIENT_OUTPUT_AMOUNT"); // INSUFFICIENT_OUTPUT_AMOUNT
		}
	}
}
