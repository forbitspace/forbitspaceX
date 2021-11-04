import { run, ethers, upgrades } from "hardhat";
import { isUUPS, PROXY_ADDRESS } from "./deploy_verify";

async function upgrade(PROXY_ADDRESS: string, isUUPS?: boolean) {
  await run("compile");

  const factory = await ethers.getContractFactory(
    isUUPS ? "forbitspaceX_UUPS" : "forbitspaceX"
  );

  const contract = await upgrades.upgradeProxy(PROXY_ADDRESS, factory);
  await contract.deployed();
}

upgrade(PROXY_ADDRESS, isUUPS)
  .then(() => {
    console.log("success");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
