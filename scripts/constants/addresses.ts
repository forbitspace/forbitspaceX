import { ChainId } from "./chain_id";

export const ZERO_ADDRESS: string =
  "0x0000000000000000000000000000000000000000";
export const ETH_ADDRESS: string = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
export const UNI_ADDRESS: string = "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984";
export const SUSHI_ROUTER_ADDRESS: string =
  "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506";
export const UNIV2_ROUTER_ADDRESS: string =
  "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
export const UNIV3_ROUTER_ADDRESS: string =
  "0xE592427A0AEce92De3Edee1F18E0157C05861564";

export const WETH_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  [ChainId.ROPSTEN]: "",
  [ChainId.GÖRLI]: "",
  [ChainId.KOVAN]: "",
  [ChainId.RINKEBY]: "0xc778417e063141139fce010982780140aa0cd5ab",
  [ChainId.BSC_MAINNET]: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  [ChainId.BSC_TESTNET]: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
  [ChainId.POLYGON]: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
  [ChainId.MUMBAI]: "0x9c3c9283d3e44854697cd22d3faa240cfb032889",
  [ChainId.AVALANCHE]: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
  [ChainId.FUJI]: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
};
