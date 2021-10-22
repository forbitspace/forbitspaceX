// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;
pragma abicoder v2;

import { IOneInch } from "./interfaces/IOneInch.sol";
import { ISake } from "./interfaces/ISake.sol";
import { ISaddle } from "./interfaces/ISaddle.sol";
import { IShell } from "./interfaces/IShell.sol";
import { ImStable } from "./interfaces/ImStable.sol";
import { IDoDo } from "./interfaces/IDoDo.sol";
import { ICurve } from "./interfaces/ICurve.sol";
import { IBancor } from "./interfaces/IBancor.sol";
import { IBalancer } from "./interfaces/IBalancer.sol";
import { ISmoothy } from "./interfaces/ISmoothy.sol";
import { IUniswapV2Router02 } from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import { ISwapRouter } from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import { Payment, SafeMath, IERC20 } from "./libraries/Payment.sol";

enum DexType {
	UNI_V2,
	UNI_V3,
	CURVE,
	CURVE_UNDERLYING,
	DODO_V1,
	DODO_V2,
	MSTABLE_MINT,
	MSTABLE_SWAP,
	MSTABLE_REDEEM,
	BANCOR,
	BALANCER,
	SHELL,
	SADDLE,
	SMOOTHY,
	SAKE,
	ONE_INCH
}

struct SwapParam {
	DexType dexType;
	address addressToApprove;
	address exchangeTarget;
	IBalancer.Swap[] swaps;
	address[] path;
	address tokenIn; // tokenFrom
	address tokenOut; // tokenTo
	uint i;
	uint j;
	uint amountIn;
	uint amountOut;
	uint24 networkFee;
	uint deadline;
}

contract forbitspaceX is Payment {
	using SafeMath for uint;

	constructor(address _WETH) Payment(_WETH) {}

	function _swapBalancer(SwapParam memory param) private {
		IBalancer.Swap[] memory swaps = new IBalancer.Swap[](1);
		swaps[0] = IBalancer.Swap({
			pool: address(0),
			tokenInParam: 0, // tokenInAmount / maxAmountIn / limitAmountIn
			tokenOutParam: 0, // minAmountOut / tokenAmountOut / limitAmountOut
			maxPrice: type(uint).max
		});
		IBalancer(param.exchangeTarget).batchSwapExactIn(
			swaps,
			param.tokenIn,
			param.tokenOut,
			param.amountIn,
			param.amountOut
		);
	}

	// swap by token index i, j

	function _swapSaddle(SwapParam memory param) private {
		ISaddle(param.exchangeTarget).swap(param.i, param.j, param.amountIn, param.amountOut, param.deadline);
	}

	function _swapSmoothy(SwapParam memory param) private {
		ISmoothy(param.exchangeTarget).swap(param.i, param.j, param.amountIn, param.amountOut);
	}

	function _swapCurve(SwapParam memory param) private {
		ICurve(param.exchangeTarget).exchange(param.i, param.j, param.amountIn, param.amountOut);
	}

	function _swapCurveUnderlying(SwapParam memory param) private {
		ICurve(param.exchangeTarget).exchange_underlying(param.i, param.j, param.amountIn, param.amountOut);
	}

	// swap by token address

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

	function _swapSake(SwapParam memory param) private {
		ISake(param.exchangeTarget).swapExactTokensForTokens(
			param.amountIn,
			param.amountOut,
			param.path,
			address(this),
			param.deadline,
			true
		);
	}

	function _swapDoDoV1(SwapParam memory param) private {
		IDoDo(param.exchangeTarget).dodoSwapV1(
			param.tokenIn,
			param.tokenOut,
			param.amountIn,
			param.amountOut,
			param.path,
			0,
			true,
			param.deadline
		);
	}

	function _swapDoDoV2(SwapParam memory param) private {
		IDoDo(param.exchangeTarget).dodoSwapV2TokenToToken(
			param.tokenIn,
			param.tokenOut,
			param.amountIn,
			param.amountOut,
			param.path,
			0,
			true,
			param.deadline
		);
	}

	function _swapmStableMint(SwapParam memory param) private {
		ImStable(param.exchangeTarget).mint(param.tokenIn, param.amountIn, param.amountOut, address(this));
	}

	function _swapmStableSwap(SwapParam memory param) private {
		ImStable(param.exchangeTarget).swap(
			param.tokenIn,
			param.tokenOut,
			param.amountIn,
			param.amountOut,
			address(this)
		);
	}

	function _swapmStableRedeem(SwapParam memory param) private {
		ImStable(param.exchangeTarget).redeem(param.tokenOut, param.amountIn, param.amountOut, address(this));
	}

	function _swapBancor(SwapParam memory param) private {
		IBancor(param.exchangeTarget).convertByPath(
			param.path,
			param.amountIn,
			param.amountOut,
			payable(address(this)),
			address(0),
			0
		);
	}

	function _swapShell(SwapParam memory param) private {
		IShell(param.exchangeTarget).originSwap(
			param.tokenIn,
			param.tokenOut,
			param.amountIn,
			param.amountOut,
			param.deadline
		);
	}

	function _swapOneInch(SwapParam memory param) private {
		IOneInch(param.exchangeTarget).swap(
			IERC20(param.tokenIn),
			IERC20(param.tokenOut),
			param.amountIn,
			param.amountOut,
			address(this)
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
			if (param[i].dexType == DexType.UNI_V2) {
				_swapUniV2(param[i]);
			} else if (param[i].dexType == DexType.UNI_V3) {
				_swapUniV3(param[i]);
			} else if (param[i].dexType == DexType.CURVE) {
				_swapCurve(param[i]);
			} else if (param[i].dexType == DexType.CURVE_UNDERLYING) {
				_swapCurveUnderlying(param[i]);
			} else if (param[i].dexType == DexType.DODO_V1) {
				_swapDoDoV1(param[i]);
			} else if (param[i].dexType == DexType.DODO_V2) {
				_swapDoDoV2(param[i]);
			} else if (param[i].dexType == DexType.MSTABLE_MINT) {
				_swapmStableMint(param[i]);
			} else if (param[i].dexType == DexType.MSTABLE_SWAP) {
				_swapmStableSwap(param[i]);
			} else if (param[i].dexType == DexType.MSTABLE_REDEEM) {
				_swapmStableRedeem(param[i]);
			} else if (param[i].dexType == DexType.BANCOR) {
				_swapBancor(param[i]);
			} else if (param[i].dexType == DexType.BALANCER) {
				_swapBalancer(param[i]);
			} else if (param[i].dexType == DexType.SHELL) {
				_swapShell(param[i]);
			} else if (param[i].dexType == DexType.SADDLE) {
				_swapSaddle(param[i]);
			} else if (param[i].dexType == DexType.SMOOTHY) {
				_swapSmoothy(param[i]);
			} else if (param[i].dexType == DexType.SAKE) {
				_swapSake(param[i]);
			} else if (param[i].dexType == DexType.ONE_INCH) {
				_swapOneInch(param[i]);
			} else {
				revert("I_T"); // incorrect type
			}
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
