import { task, HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-etherscan";
import * as dotenv from "dotenv";

dotenv.config();

const { API_KEY, INFURA_KEY, PRIVATE_KEY, PRIVATE_KEY_MAIN } = process.env;
const apiKey: string = API_KEY || "";
const infuraKey: string = INFURA_KEY || "";
const privateKey: string = PRIVATE_KEY || "";
const privateKeyMain: string = PRIVATE_KEY_MAIN || "";

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  defaultNetwork: "rinkeby",
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3/" + infuraKey,
      accounts: [privateKeyReal],
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/" + infuraKey,
      accounts: [privateKey],
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [privateKey],
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000000,
          },
        },
      },
      {
        version: "0.6.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000000,
          },
        },
      },
    ],
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: apiKey,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 20000,
  },
};

export default config;
