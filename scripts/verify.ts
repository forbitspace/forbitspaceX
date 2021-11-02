import { run, network } from "hardhat";

import {
  getImplementationAddress,
  getAdminAddress,
  getChainId,
} from "@openzeppelin/upgrades-core";

async function main() {
  const provider = network.provider;

  const PROXY_ADDRESS = "0xeE2D18D34991c24dcb0EAF49B04922a5D58c02Ef";

  console.log();

  const chainId = await getChainId(provider);
  const ADMIN_ADDRESS = await getAdminAddress(provider, PROXY_ADDRESS);
  const IMPLEMENT_ADDRESS = await getImplementationAddress(
    provider,
    PROXY_ADDRESS
  );

  await run("verify:verify", { address: IMPLEMENT_ADDRESS });

  console.log({
    ADMIN_ADDRESS,
    PROXY_ADDRESS,
    IMPLEMENT_ADDRESS,
    chainId,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
