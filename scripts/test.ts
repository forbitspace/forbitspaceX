import { ethers } from "hardhat";

// const PROXY_ADDRESS = "0x44B7a535b1bDD4fE8719b067C01FB8e7ECcCbdE6"; // Transparent
const PROXY_ADDRESS = "0x95Bd7eE97BE1dA0aACE068FD392d0a3F5d7CC0b4"; // UUPS

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
