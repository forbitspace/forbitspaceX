import { run, ethers, upgrades } from "hardhat";

async function main() {
  await run("compile");

  const PROXY_ADDRESS = "0xcF1dCaFFf703Fa0219AB779221A14aa5C39c945f"; // UUPS
  // const PROXY_ADDRESS = "0x71fd6e25C1f39263b334eE188DC0d4C4d36E4779"; // Transparent

  const factory = await ethers.getContractFactory("forbitspaceX_UUPS"); // UUPS
  // const factory = await ethers.getContractFactory("forbitspaceX"); // Transparent

  const contract = await upgrades.upgradeProxy(PROXY_ADDRESS, factory);
  await contract.deployed();

  console.log("success");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
