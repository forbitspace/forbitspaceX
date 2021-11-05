import { run, ethers, upgrades, network } from "hardhat";
import { getChainId } from "@openzeppelin/upgrades-core";
import { ChainId } from "./constants/chain_id";
import { WETH_ADDRESSES, ZERO_ADDRESS } from "./constants/addresses";

export async function deploy(
  isUUPS?: boolean,
  feeTo?: string
): Promise<string> {
  await run("compile");

  if (!feeTo || feeTo === "") {
    feeTo = ZERO_ADDRESS;
  }

  const chainId: ChainId = await getChainId(network.provider);

  console.log("chainId >>>", chainId);

  const WETH_ADDRESS: string = WETH_ADDRESSES[chainId];

  const factory = await ethers.getContractFactory(
    isUUPS ? "forbitspaceX_UUPS" : "forbitspaceX"
  );

  const proxy = await upgrades.deployProxy(factory, [WETH_ADDRESS, feeTo]);
  await proxy.deployed();

  return proxy.address;
}

// deploy(true, "")
//   .then(() => {
//     process.exit(0);
//   })
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });
