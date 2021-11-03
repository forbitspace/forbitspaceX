import { run, network } from "hardhat";

import {
  getImplementationAddress,
  getAdminAddress,
  getChainId,
} from "@openzeppelin/upgrades-core";

async function main() {
  const provider = network.provider;

  // const PROXY_ADDRESS = "0x6F50E98e8cEeCad78Db329Dd5c912deC0B78C098"; // Transparent
  const PROXY_ADDRESS = "0xF7cda6A99e7c4ebF63C89FAebdCF5f864618f68f"; // UUPS

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
