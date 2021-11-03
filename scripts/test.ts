import { ethers } from "hardhat";

// const PROXY_ADDRESS = "0x6F50E98e8cEeCad78Db329Dd5c912deC0B78C098"; // Transparent
const PROXY_ADDRESS = "0xF7cda6A99e7c4ebF63C89FAebdCF5f864618f68f"; // UUPS

async function main() {
  const [signer] = await ethers.getSigners();

  const forbitspaceX = await ethers.getContractAt(
    "forbitspaceX",
    PROXY_ADDRESS,
    signer
  );
  const [owner, feeTo, ETH, WETH, version]: string[] = await Promise.all([
    forbitspaceX.owner(),
    forbitspaceX.feeTo(),
    forbitspaceX.ETH(),
    forbitspaceX.WETH(),
    forbitspaceX.version(),
  ]);

  console.log({ owner, feeTo, ETH, WETH, version });
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
