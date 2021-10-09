import { resolve } from "path";
import { readFileSync, writeFileSync } from "fs";
import { run, ethers } from "hardhat";

// import { WETH_ADDRESS } from "./constants/addresses";

async function main() {
  await run("compile");
  // rinkeby
  const WETH_ADDRESS = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
  const NEW_OWNER_ADDRESS = "";
  const contractName = "forbitspaceX";
  const factory = await ethers.getContractFactory(contractName);
  const contract = await factory.deploy(WETH_ADDRESS);
  await contract.deployed();
  console.log(`${contractName} deployed to >>>`, contract.address);

  await writeContractJson(
    `../artifacts/contracts-merged/${contractName}.sol/${contractName}.json`,
    `../abis/${contractName}-polygon.json`,
    contract.address
  );

  if (NEW_OWNER_ADDRESS && NEW_OWNER_ADDRESS != "") {
    console.log("Transfer owner");

    await contract.transferOwnership(NEW_OWNER_ADDRESS);
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
