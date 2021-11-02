import { run, ethers, upgrades } from "hardhat";

async function main() {
  await run("compile");

  const PROXY_ADDRESS = "0x06B526413B5F42acc6005c8F236384B38CAC93ec";
  const factory = await ethers.getContractFactory("forbitspaceX");

  const contract = await upgrades.upgradeProxy(PROXY_ADDRESS, factory);
  await contract.deployed();

  console.log("success");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
