// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.8;
pragma abicoder v2;

import { forbitspaceX } from "./forbitspaceX.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract forbitspaceX_UUPS is forbitspaceX, UUPSUpgradeable {
	function _authorizeUpgrade(address newImplementation) internal virtual override {}
}
