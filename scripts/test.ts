import { ethers } from "hardhat";

// const FORBITSPACEX_ADDRESS = "0xcF1dCaFFf703Fa0219AB779221A14aa5C39c945f";
const FORBITSPACEX_ADDRESS = "0x71fd6e25C1f39263b334eE188DC0d4C4d36E4779";

async function main() {
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

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
