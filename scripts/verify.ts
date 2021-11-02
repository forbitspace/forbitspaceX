import { run, network } from "hardhat";

import {
  getImplementationAddress,
  getAdminAddress,
  getChainId,
} from "@openzeppelin/upgrades-core";

async function main() {
  const provider = network.provider;

  // const PROXY_ADDRESS = "0xcF1dCaFFf703Fa0219AB779221A14aa5C39c945f";
  const PROXY_ADDRESS = "0x71fd6e25C1f39263b334eE188DC0d4C4d36E4779";

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
