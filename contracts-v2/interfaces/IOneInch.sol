pragma solidity ^0.8.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IOneInch {
	function swap(
		IERC20 src,
		IERC20 dst,
		uint amount,
		uint minReturn,
		address referral
	) external payable returns (uint result);
}
