import { resolve } from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { run, ethers, upgrades } from "hardhat";
import { ChainId } from "./constants/chain_id";
import { WETH_ADDRESSES } from "./constants/addresses";

async function main() {
  await run("compile");
  const [signer] = await ethers.getSigners();
  const chainId: ChainId = await signer.getChainId();

  console.log("chainId >>>", chainId);

  const WETH_ADDRESS: string = WETH_ADDRESSES[chainId];
  const PROXY_ADDRESS = "0x06B526413B5F42acc6005c8F236384B38CAC93ec";
  const forbitspaceX_factory = await ethers.getContractFactory("forbitspaceX");

  const contract = await upgrades.upgradeProxy(
    PROXY_ADDRESS,
    forbitspaceX_factory
  );
  await contract.deployed();

  // await writeContractJson(
  //   chainId,
  //   contract.address,
  //   `../artifacts/contracts/${contractName}.sol/${contractName}.json`,
  //   `../abis/${contractName}.json`
  // );

  console.log("success");
}

async function writeContractJson(
  chainId: ChainId,
  address: string,
  src: string,
  dest: string
) {
  var data: any = await readFileSync(
    resolve(__dirname, existsSync(resolve(__dirname, dest)) ? dest : src)
  );
  data = JSON.parse(data.toString());
  console.log(data.addresses);
  if (!data.addresses)
    data.addresses = {
      [ChainId.MAINNET]: "",
      [ChainId.RINKEBY]: "",
      [ChainId.BSC_MAINNET]: "",
      [ChainId.BSC_TESTNET]: "",
      [ChainId.POLYGON]: "",
      [ChainId.MUMBAI]: "",
    };
  data.addresses[chainId] = address;
  await writeFileSync(resolve(__dirname, dest), JSON.stringify(data));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
