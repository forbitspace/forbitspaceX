import * as dotenv from "dotenv";

dotenv.config();

export const API_KEY: string = process.env.API_KEY || "";

export const INFURA_KEY: string = process.env.INFURA_KEY || "";

export const PRIVATE_KEY: string = process.env.PRIVATE_KEY || "";

export const PRIVATE_KEY_MAINNET: string =
  process.env.PRIVATE_KEY_MAINNET || "";

export const PRIVATE_KEY_POLYGON: string =
  process.env.PRIVATE_KEY_POLYGON || "";

export const PRIVATE_KEY_BSC: string = process.env.PRIVATE_KEY_BSC || "";

export const PRIVATE_KEY_AVALANCHE: string =
  process.env.PRIVATE_KEY_AVALANCHE || "";
