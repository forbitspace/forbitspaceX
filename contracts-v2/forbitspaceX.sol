// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;
pragma abicoder v2;

import { ISmoothy } from "./interfaces/ISmoothy.sol";
import { IUniswapV2Router02 } from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import { ISwapRouter } from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import { Payment, SafeMath, Address } from "./libraries/Payment.sol";

enum DexType {
	UNISWAP_V2,
	UNISWAP_V3,
	CURVE_V1,
	CURVE_V2,
	DODO_V1,
	DODO_V2,
	BANCOR,
	BALANCER,
	SHELL,
	SADDLE,
	SMOOTHY,
	SAKE,
	MSTABLE,
	ONE_INCH
}

struct SwapParam {
	DexType dexType;
	address addressToApprove;
	address exchangeTarget;
	address[] path;
	uint i;
	uint j;
	uint amountIn;
	uint amountOut;
	uint24 networkFee;
	uint deadline;
}

contract forbitspaceX is Payment {
	using SafeMath for uint;
	using Address for address;

	constructor(address _WETH) Payment(_WETH) {}

	function _swapSmoothy(SwapParam memory param) private {
		ISmoothy(param.exchangeTarget).swap(param.i, param.j, param.amountIn, param.amountOut);
	}

	function _swapUniV2(SwapParam memory param) private {
		IUniswapV2Router02(param.exchangeTarget).swapExactTokensForTokens(
			param.amountIn,
			param.amountOut,
			param.path,
			address(this),
			param.deadline
		);
	}

	function _swapUniV3(SwapParam memory param) private {
		ISwapRouter(param.exchangeTarget).exactInputSingle(
			ISwapRouter.ExactInputSingleParams({
				tokenIn: param.path[0],
				tokenOut: param.path[param.path.length - 1],
				fee: param.networkFee,
				recipient: address(this),
				deadline: param.deadline,
				amountIn: param.amountIn,
				amountOutMinimum: param.amountOut,
				sqrtPriceLimitX96: 0
			})
		);
	}

	function _swaps(SwapParam[] memory param) private {
		for (uint i = 0; i < param.length; i++) {
			uint tokenInBal = balanceOf(param[i].path[0]);

			require(tokenInBal > 0, "N_E_T"); // not enough tokens

			if (tokenInBal < param[i].amountIn) {
				param[i].amountIn = tokenInBal;
			}

			// approve
			approve(param[i].addressToApprove, param[i].path[0], param[i].amountIn);

			// swap
			if (param[i].dexType == DexType.UNISWAP_V2) _swapUniV2(param[i]);
			else if (param[i].dexType == DexType.UNISWAP_V3) _swapUniV3(param[i]);
		}
	}

	function aggregate(
		address tokenIn,
		address tokenOut,
		uint amountTotal,
		SwapParam[] calldata params
	) public payable returns (uint amountInTotal, uint amountOutTotal) {
		// invalid tokens address
		require(!(tokenIn == tokenOut), "I_T_A");
		require(!(tokenIn == ETH_ADDRESS && tokenOut == WETH_ADDRESS), "I_T_A");
		require(!(tokenIn == WETH_ADDRESS && tokenOut == ETH_ADDRESS), "I_T_A");

		// invalid value
		if (tokenIn == ETH_ADDRESS) require((amountTotal = msg.value) > 0, "I_V");
		else require(msg.value == 0, "I_V");

		pay(tokenIn, amountTotal);

		amountInTotal = balanceOf(tokenIn); // amountInTotal before
		amountOutTotal = balanceOf(tokenOut); // amountOutTotal before

		_swaps(params); // swap tokens on multi dex

		amountInTotal = amountInTotal.sub(balanceOf(tokenIn)); // amountInTotal after
		amountOutTotal = balanceOf(tokenOut).sub(amountOutTotal); // amountOutTotal after

		refund(tokenIn, amountTotal.sub(amountInTotal.mul(2000).div(1999), "N_E_T")); // 0.05% fee
		refund(tokenOut, amountOutTotal);

		collectTokens(tokenIn);
	}
}
