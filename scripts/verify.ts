import { run, ethers } from "hardhat";

// import { addresses as FORBITSPACEX_ADDRESSES } from "../abis/forbitspaceX.json";
import { WETH_ADDRESSES } from "./constants/addresses";
import { ChainId } from "./constants/chain_id";

async function main() {
  const [signer] = await ethers.getSigners();
  const chainId: ChainId = await signer.getChainId();

  const FORBITSPACEX_ADDRESS = "0xb3fef4b71a4edb6f1bd51bf9417876042b936dd6";
  const WETH_ADDRESS = WETH_ADDRESSES[chainId];

  console.log({ chainId, FORBITSPACEX_ADDRESS, WETH_ADDRESS });

  await run("verify:verify", {
    address: FORBITSPACEX_ADDRESS,
    constructorArguments: [WETH_ADDRESS],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
