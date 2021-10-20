pragma solidity ^0.8.0;

interface IBancor {
	function rateByPath(address[] memory path, uint amount) external view returns (uint);

	function convertByPath(
		address[] memory path,
		uint amount,
		uint minReturn,
		address payable beneficiary,
		address affiliateAccount,
		uint affiliateFee
	) external payable returns (uint);

	function convert(
		address[] memory _path,
		uint _amount,
		uint _minReturn
	) external payable returns (uint);
}
