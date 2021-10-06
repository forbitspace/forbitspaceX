import * as dotenv from "dotenv";

dotenv.config();

const {
  API_KEY,
  INFURA_KEY,
  PRIVATE_KEY,
  PRIVATE_KEY_MAINNET,
  PRIVATE_KEY_POLYGON,
  PRIVATE_KEY_BSC,
} = process.env;
export const apiKey: string = API_KEY || "";
export const infuraKey: string = INFURA_KEY || "";
export const privateKey: string = PRIVATE_KEY || "";
export const privateKeyMainnet: string = PRIVATE_KEY_MAINNET || "";
export const privateKeyPolygon: string = PRIVATE_KEY_POLYGON || "";
export const privateKeyBSC: string = PRIVATE_KEY_BSC || "";
