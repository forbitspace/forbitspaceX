import { run, ethers } from "hardhat";

// import { addresses as FORBITSPACEX_ADDRESSES } from "../abis/forbitspaceX.json";
import { WETH_ADDRESSES } from "./constants/addresses";
import { ChainId } from "./constants/chain_id";

// avalanche 0xab026fD7F4dfb57C338351175B002eD53E485487

async function main() {
  const [signer] = await ethers.getSigners();
  const chainId: ChainId = await signer.getChainId();

  const PROXY_ADDRESS = "0x06B526413B5F42acc6005c8F236384B38CAC93ec";
  const IMPLEMENT_ADDRESS = "0xaba9f41133f0a14d57fb64c902ab0f0d6ae23fbc";
  const WETH_ADDRESS = WETH_ADDRESSES[chainId];

  console.log({ chainId, WETH_ADDRESS, IMPLEMENT_ADDRESS });

  await run("verify:verify", {
    address: IMPLEMENT_ADDRESS,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
