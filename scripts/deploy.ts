import { resolve } from "path";
import { readFileSync, writeFileSync } from "fs";
import { run, ethers } from "hardhat";

// import { WETH_ADDRESS } from "./constants/addresses";

async function main() {
  await run("compile");
  // rinkeby
  const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
  const NEW_OWNER_ADDRESS = "";

  const forbitspaceX_factory = await ethers.getContractFactory("forbitspaceX");
  const forbitspaceX = await forbitspaceX_factory.deploy(WETH_ADDRESS);
  console.log("forbitspaceX deployed to:", forbitspaceX.address);

  await writeContractJson(
    "../artifacts/contracts/forbitspaceX.sol/forbitspaceX.json",
    "../abis/forbitspaceX.json",
    forbitspaceX.address
  );

  if (NEW_OWNER_ADDRESS != "") {
    await forbitspaceX.methods.transferOwnership(NEW_OWNER_ADDRESS);
  }

  console.log("success");
}

async function writeContractJson(src: string, dest: string, address: string) {
  var data: any = await readFileSync(resolve(__dirname, src));
  data = JSON.parse(data.toString());
  data.address = address;
  await writeFileSync(resolve(__dirname, dest), JSON.stringify(data));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });