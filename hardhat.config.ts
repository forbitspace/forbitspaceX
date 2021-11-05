import { task, HardhatUserConfig } from "hardhat/config";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3";

import {
  PRIVATE_KEY,
  PRIVATE_KEY_MAINNET,
  ETHEREUM_API_KEY,
  BSC_API_KEY,
  POLYGON_API_KEY,
  AVALANCHE_API_KEY,
  ETHEREUM_RPC,
  RINKEBY_RPC,
  BSC_RPC,
  BSC_TESTNET_RPC,
  POLYGON_RPC,
  MUMBAI_RPC,
  AVALANCHE_RPC,
  FUJI_RPC,
} from "./config";

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  defaultNetwork: "rinkeby",
  networks: {
    hardhat: {
      loggingEnabled: true,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: [PRIVATE_KEY],
      loggingEnabled: true,
    },
    mainnet: {
      url: ETHEREUM_RPC,
      accounts: [PRIVATE_KEY_MAINNET],
      loggingEnabled: true,
    },
    rinkeby: {
      url: RINKEBY_RPC,
      accounts: [PRIVATE_KEY],
      loggingEnabled: true,
    },
    bsc: {
      url: BSC_RPC,
      accounts: [PRIVATE_KEY_MAINNET],
      loggingEnabled: true,
    },
    bsc_testnet: {
      url: BSC_TESTNET_RPC,
      accounts: [PRIVATE_KEY],
      loggingEnabled: true,
    },
    polygon: {
      url: POLYGON_RPC,
      accounts: [PRIVATE_KEY_MAINNET],
      loggingEnabled: true,
    },
    mumbai: {
      url: MUMBAI_RPC,
      accounts: [PRIVATE_KEY],
      loggingEnabled: true,
    },
    avalanche: {
      url: AVALANCHE_RPC,
      accounts: [PRIVATE_KEY_MAINNET],
      loggingEnabled: true,
    },
    fuji_testnet: {
      url: FUJI_RPC,
      accounts: [PRIVATE_KEY],
      loggingEnabled: true,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.2",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000000,
          },
        },
      },
      {
        version: "0.8.8",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000000,
          },
        },
      },
    ],
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: POLYGON_API_KEY,
  },
  paths: {
    // sources: "./contracts-upgradeable",
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
