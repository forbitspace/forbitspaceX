import { run, ethers, upgrades } from "hardhat";

async function main() {
  await run("compile");

  // const PROXY_ADDRESS = "0x6F50E98e8cEeCad78Db329Dd5c912deC0B78C098"; // Transparent
  const PROXY_ADDRESS = "0xF7cda6A99e7c4ebF63C89FAebdCF5f864618f68f"; // UUPS

  // const factory = await ethers.getContractFactory("forbitspaceX_Transparent"); // Transparent
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
