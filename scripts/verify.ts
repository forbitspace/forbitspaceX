import { run, network } from "hardhat";

import {
  getImplementationAddress,
  getAdminAddress,
  getChainId,
} from "@openzeppelin/upgrades-core";

async function main() {
  const provider = network.provider;

  // const PROXY_ADDRESS = "0x44B7a535b1bDD4fE8719b067C01FB8e7ECcCbdE6"; // Transparent
  const PROXY_ADDRESS = "0x95Bd7eE97BE1dA0aACE068FD392d0a3F5d7CC0b4"; // UUPS

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
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
