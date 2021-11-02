// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.8;
pragma abicoder v2;

import { Payment, SafeMathUpgradeable, AddressUpgradeable } from "./libraries/Payment.sol";

contract forbitspaceX is Payment {
	using SafeMathUpgradeable for uint;
	using AddressUpgradeable for address;

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

	event AggregateSwapped(
		uint amountIn,
		uint amountOut,
		address indexed tokenIn,
		address indexed tokenOut,
		address indexed recipient
	);

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() initializer {}

	function aggregate(AggregateParam calldata aParam)
		public
		payable
		returns (uint amountInActual, uint amountOutActual)
	{
		address tokenIn = aParam.tokenIn != address(0) ? aParam.tokenIn : ETH();
		address tokenOut = aParam.tokenOut != address(0) ? aParam.tokenOut : ETH();
		uint amountInTotal = tokenIn != ETH() ? aParam.amountInTotal : msg.value;
		address recipient = aParam.recipient != address(0) ? aParam.recipient : _msgSender();

		// I_P: invalid path
		require(tokenIn != tokenOut, "I_P");
		require(!(tokenIn == ETH() && tokenOut == WETH()), "I_P");
		require(!(tokenIn == WETH() && tokenOut == ETH()), "I_P");

		// I_V: invalid value
		require(tokenIn != ETH() && msg.value == 0, "I_V");
		require(amountInTotal > 0, "I_V");

		// receive tokens
		pay(address(this), tokenIn, amountInTotal);

		// amountAcutual before
		amountInActual = balanceOf(tokenIn);
		amountOutActual = balanceOf(tokenOut);

		// call swap on multi dexs
		performSwap(aParam.sParams);

		// amountAcutual after
		amountInActual = amountInActual.sub(balanceOf(tokenIn));
		amountOutActual = balanceOf(tokenOut).sub(amountOutActual);

		// I_A_T_A: incorrect actual total amounts
		require((amountInActual > 0) && (amountOutActual > 0), "I_A_T_A");

		// take 0.05% fee
		amountOutActual = amountOutActual.mul(9995).div(10000);

		// refund tokens
		// N_E_T: not enough tokens
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

			require(addressToApprove != address(0) && exchangeTarget != address(0), "Z"); // zero-address
			require(tokenIn != address(0) && tokenIn != ETH(), "I_T_I"); // invalid token in
			require(tokenOut != address(0) && tokenOut != ETH(), "I_T_O"); // invalid token out
			require(tokenIn != tokenOut, "I_P");

			approve(addressToApprove, tokenIn, type(uint).max);

			uint amountInActual = balanceOf(tokenIn);
			uint amountOutActual = balanceOf(tokenOut);

			exchangeTarget.functionCall(params[i].swapData, "L_C_F"); // low-level call failed

			amountInActual = amountInActual.sub(balanceOf(tokenIn));
			amountOutActual = balanceOf(tokenOut).sub(amountOutActual);

			require((amountInActual > 0) && (amountOutActual > 0), "I_A_A"); // invalid actual amounts
		}
	}
}
