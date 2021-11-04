import { ethers } from "hardhat";
import { PROXY_ADDRESS } from "./deploy_verify";

async function test(PROXY_ADDRESS: string) {
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

test(PROXY_ADDRESS)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
