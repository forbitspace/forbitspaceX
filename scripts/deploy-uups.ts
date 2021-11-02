import { run, ethers, upgrades, network } from "hardhat";
import { getChainId } from "@openzeppelin/upgrades-core";
import { ChainId } from "./constants/chain_id";
import { WETH_ADDRESSES, ZERO_ADDRESS } from "./constants/addresses";

async function main() {
  await run("compile");

  const chainId: ChainId = await getChainId(network.provider);

  console.log("chainId >>>", chainId);

  const WETH_ADDRESS: string = WETH_ADDRESSES[chainId];

  const forbitspaceX_factory = await ethers.getContractFactory(
    "forbitspaceX_UUPS"
  );

  var NEW_OWNER_ADDRESS: string = "";

  if (!NEW_OWNER_ADDRESS || NEW_OWNER_ADDRESS === "") {
    NEW_OWNER_ADDRESS = ZERO_ADDRESS;
  }

  const proxy = await upgrades.deployProxy(
    forbitspaceX_factory,
    [WETH_ADDRESS, NEW_OWNER_ADDRESS],
    {
      kind: "uups",
    }
  );
  await proxy.deployed();

  console.log(`UUPS deployed to >>>`, proxy.address);
}
main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
