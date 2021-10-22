// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;

interface IDoDoV1 {
	function querySellQuoteToken(address dodoV1Pool, uint quoteAmount) external view returns (uint receivedBaseAmount);

	function querySellBaseToken(address dodoV1Pool, uint baseAmount) external view returns (uint receivedQuoteAmount);
}

interface IDoDoV2 {
	function querySellBase(address trader, uint payBaseAmount)
		external
		view
		returns (uint receiveQuoteAmount, uint mtFee);

	function querySellQuote(address trader, uint payQuoteAmount)
		external
		view
		returns (uint receiveBaseAmount, uint mtFee);
}

interface IDoDo {
	function dodoSwapV1(
		address fromToken,
		address toToken,
		uint fromTokenAmount,
		uint minReturnAmount,
		address[] memory dodoPairs,
		uint directions,
		bool,
		uint deadLine
	) external payable returns (uint returnAmount);

	function dodoSwapV2TokenToToken(
		address fromToken,
		address toToken,
		uint fromTokenAmount,
		uint minReturnAmount,
		address[] memory dodoPairs,
		uint directions,
		bool isIncentive,
		uint deadLine
	) external returns (uint returnAmount);
}
