import { run, ethers, upgrades } from "hardhat";

async function main() {
  await run("compile");

  // const PROXY_ADDRESS = "0x44B7a535b1bDD4fE8719b067C01FB8e7ECcCbdE6"; // Transparent
  const PROXY_ADDRESS = "0x95Bd7eE97BE1dA0aACE068FD392d0a3F5d7CC0b4"; // UUPS

  // const factory = await ethers.getContractFactory("forbitspaceX"); // Transparent
  const factory = await ethers.getContractFactory("forbitspaceX_UUPS"); // UUPS

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
