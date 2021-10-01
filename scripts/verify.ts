import { run, ethers } from "hardhat";

import { address as FORBITSPACEX_ADDRESS } from "../abis/forbitspaceX.json";
// import { WETH_ADDRESS } from "./constants/addresses";

async function main() {
  // rinkeby
  const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

  await run("verify:verify", {
    address: FORBITSPACEX_ADDRESS,
    constructorArguments: [WETH_ADDRESS],
  });

  console.log({ FORBITSPACEX_ADDRESS, WETH_ADDRESS });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
