// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.8;
pragma abicoder v2;

import { forbitspaceX } from "./forbitspaceX.sol";

contract forbitspaceX_Transparent is forbitspaceX {
	function version() public pure virtual override returns (string memory) {
		return "2.0.0";
	}
}
