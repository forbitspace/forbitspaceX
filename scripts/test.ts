import { ethers } from "hardhat";

const FORBITSPACEX_ADDRESS = "0xeE2D18D34991c24dcb0EAF49B04922a5D58c02Ef";

async function test() {
  const [signer] = await ethers.getSigners();

  const forbitspaceX = await ethers.getContractAt(
    "forbitspaceX",
    FORBITSPACEX_ADDRESS,
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

test()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
