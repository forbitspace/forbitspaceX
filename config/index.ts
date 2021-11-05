import * as dotenv from "dotenv";

dotenv.config();

export const PRIVATE_KEY: string = process.env.PRIVATE_KEY || "";

export const PRIVATE_KEY_MAINNET: string =
  process.env.PRIVATE_KEY_MAINNET || "";

export const ETHEREUM_API_KEY: string = process.env.ETHEREUM_API_KEY || "";

export const BSC_API_KEY: string = process.env.BSC_API_KEY || "";

export const POLYGON_API_KEY: string = process.env.POLYGON_API_KEY || "";

export const AVALANCHE_API_KEY: string = process.env.AVALANCHE_API_KEY || "";

export const ETHEREUM_RPC: string = process.env.ETHEREUM_RPC || "";

export const RINKEBY_RPC: string = process.env.RINKEBY_RPC || "";

export const BSC_RPC: string = process.env.BSC_RPC || "";

export const BSC_TESTNET_RPC: string = process.env.BSC_TESTNET_RPC || "";

export const POLYGON_RPC: string = process.env.POLYGON_RPC || "";

export const MUMBAI_RPC: string = process.env.MUMBAI_RPC || "";

export const AVALANCHE_RPC: string = process.env.AVALANCHE_RPC || "";

export const FUJI_RPC: string = process.env.FUJI_RPC || "";
