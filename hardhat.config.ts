import { task, HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-etherscan";
import {
  API_KEY,
  INFURA_KEY,
  PRIVATE_KEY,
  PRIVATE_KEY_MAINNET,
  PRIVATE_KEY_POLYGON,
  PRIVATE_KEY_BSC,
  PRIVATE_KEY_AVALANCHE,
} from "./config";

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3/" + INFURA_KEY,
      accounts: [PRIVATE_KEY_MAINNET],
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/" + INFURA_KEY,
      accounts: [PRIVATE_KEY],
    },
    polygon: {
      url: "https://polygon-rpc.com/",
      accounts: [PRIVATE_KEY_POLYGON],
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [PRIVATE_KEY],
    },
    bsc_mainnet: {
      url: "https://bsc-dataseed.binance.org/",
      accounts: [PRIVATE_KEY_BSC],
    },
    bsc_testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: [PRIVATE_KEY],
    },
    avalanche: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      accounts: [PRIVATE_KEY_AVALANCHE],
    },
    fuji_testnet: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: [PRIVATE_KEY],
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.0",
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
    apiKey: API_KEY,
  },
  paths: {
    sources: "./contracts-merged",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 20000,
  },
};

export default config;
