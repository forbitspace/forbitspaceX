// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.8;
pragma abicoder v2;

import { Payment, SafeMath, Address } from "./libraries/Payment.sol";
import { IforbitspaceX } from "./interfaces/IforbitspaceX.sol";

contract forbitspaceX is IforbitspaceX, Payment {
	using SafeMath for uint;
	using Address for address;

	// Z: zero-address
	// I_P: invalid path
	// I_V: invalid value
	// I_A_T_A: invalid actual total amounts
	// I_A_A: invalid actual amounts
	// I_T_I: invalid token in
	// I_T_O: invalid token out
	// N_E_T: not enough tokens
	// L_C_F: low-level call failed

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() initializer {}

	function version() public pure virtual override returns (string memory) {
		return "2.0.0";
	}

	function aggregate(AggregateParam calldata aParam)
		public
		payable
		returns (uint amountInActual, uint amountOutActual)
	{
		address tokenIn = aParam.tokenIn == address(0) ? ETH() : aParam.tokenIn;
		address tokenOut = aParam.tokenOut == address(0) ? ETH() : aParam.tokenOut;
		address recipient = aParam.recipient == address(0) ? _msgSender() : aParam.recipient;
		uint amountInTotal = tokenIn == ETH() ? msg.value : aParam.amountInTotal;

		if (tokenIn != ETH()) {
			require(msg.value == 0, "I_V");
		}
		require(amountInTotal > 0, "I_V");
		require(!(tokenIn == tokenOut), "I_P");
		require(!(tokenIn == ETH() && tokenOut == WETH()), "I_P");
		require(!(tokenIn == WETH() && tokenOut == ETH()), "I_P");

		// receive tokens
		pay(address(this), tokenIn, amountInTotal);

		// amountActual before
		amountInActual = balanceOf(tokenIn);
		amountOutActual = balanceOf(tokenOut);

		// call swap on multi dexs
		performSwap(aParam.sParams);

		// amountActual after
		amountInActual = amountInActual.sub(balanceOf(tokenIn));
		amountOutActual = balanceOf(tokenOut).sub(amountOutActual);

		require((amountInActual > 0) && (amountOutActual > 0), "I_A_T_A");

		// take 0.05% fee
		amountOutActual = amountOutActual.mul(9995).div(10000);

		// refund tokens
		pay(_msgSender(), tokenIn, amountInTotal.sub(amountInActual, "N_E_T"));
		pay(recipient, tokenOut, amountOutActual);

		// sweep tokens for owner
		collectTokens(tokenIn);
		collectTokens(tokenOut);

		emit AggregateSwapped(amountInActual, amountOutActual, tokenIn, tokenOut, recipient);
	}

	function performSwap(SwapParam[] calldata params) private {
		for (uint i = 0; i < params.length; i++) {
			address addressToApprove = params[i].addressToApprove;
			address exchangeTarget = params[i].exchangeTarget;
			address tokenIn = params[i].tokenIn;
			address tokenOut = params[i].tokenOut;

			require(addressToApprove != address(0) && exchangeTarget != address(0), "Z");
			require(tokenIn != address(0) && tokenIn != ETH(), "I_T_I");
			require(tokenOut != address(0) && tokenOut != ETH(), "I_T_O");
			require(tokenIn != tokenOut, "I_P");

			approve(addressToApprove, tokenIn, type(uint).max);

			// amountActual before
			uint amountInActual = balanceOf(tokenIn);
			uint amountOutActual = balanceOf(tokenOut);

			exchangeTarget.functionCall(params[i].swapData, "L_C_F");

			// amountActual after
			amountInActual = amountInActual.sub(balanceOf(tokenIn));
			amountOutActual = balanceOf(tokenOut).sub(amountOutActual);

			require((amountInActual > 0) && (amountOutActual > 0), "I_A_A");
		}
	}
}
