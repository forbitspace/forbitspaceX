import { run, network } from "hardhat";

import {
  getImplementationAddress,
  getAdminAddress,
} from "@openzeppelin/upgrades-core";

export async function verify(PROXY_ADDRESS: string) {
  const provider = network.provider;

  const ADMIN_ADDRESS = await getAdminAddress(provider, PROXY_ADDRESS);
  const IMPLEMENT_ADDRESS = await getImplementationAddress(
    provider,
    PROXY_ADDRESS
  );

  await run("verify:verify", { address: IMPLEMENT_ADDRESS });

  console.log({
    ADMIN_ADDRESS,
    IMPLEMENT_ADDRESS,
  });
}
