import { run, ethers } from "hardhat";

// import { address as FORBITSPACEX_ADDRESS } from "../abis/forbitspaceX.json";
// import { WETH_ADDRESS } from "./constants/addresses";

async function main() {
  // rinkeby
  const FORBITSPACEX_ADDRESS = "0x99556C7B90e91fDB35A15D2b735a7542aa4C5fC6";
  const WETH_ADDRESS = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";

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
