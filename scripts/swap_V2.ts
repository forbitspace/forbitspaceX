import { ethers } from "hardhat";
import { Contract, BigNumber, BigNumberish, utils } from "ethers";

import {
  abi as FORBITSPACEX_ABI,
  addresses as FORBITSPACEX_ADDRESSES,
} from "../abis/forbitspaceX.json";
import { abi as ERC20_ABI } from "../abis/IERC20.json";

import {
  ETH_ADDRESS,
  WETH_ADDRESSES,
  UNI_ADDRESS,
  SUSHI_ROUTER_ADDRESS,
  UNIV2_ROUTER_ADDRESS,
  UNIV3_ROUTER_ADDRESS,
} from "./constants/addresses";

import { ChainId } from "./constants/chain_id";

enum DexType {
  UNI_V2,
  UNI_V3,
  CURVE,
  CURVE_UNDERLYING,
  DODO_V1,
  DODO_V2,
  MSTABLE_MINT,
  MSTABLE_SWAP,
  MSTABLE_REDEEM,
  BANCOR,
  BALANCER,
  SHELL,
  SADDLE,
  SMOOTHY,
  SAKE,
  ONE_INCH,
}

type Swap = {
  pool: string;
  tokenInParam: BigNumberish; // tokenInAmount / maxAmountIn / limitAmountIn
  tokenOutParam: BigNumberish; // minAmountOut / tokenAmountOut / limitAmountOut
  maxPrice: BigNumberish;
};

type SwapParam = {
  dexType: DexType;
  addressToApprove: string;
  exchangeTarget: string;
  swaps: Swap[];
  path: string[];
  tokenIn: string; // tokenFrom
  tokenOut: string; // tokenTo
  i: BigNumberish;
  j: BigNumberish;
  amountIn: BigNumberish;
  amountOut: BigNumberish;
  networkFee: BigNumberish;
  deadline: BigNumberish;
};

async function main() {
  const [signer] = await ethers.getSigners();

  const chainId: ChainId = await signer.getChainId();

  const WETH_ADDRESS = WETH_ADDRESSES[chainId];

  const FORBITSPACEX_ADDRESS = "0xfC8af0CFADA6d9062CA090BB6C00860c0a58e25a";

  const forbitspaceX = await ethers.getContractAt(
    "forbitspaceX",
    FORBITSPACEX_ADDRESS,
    signer
  );

  const WETH: Contract = new Contract(WETH_ADDRESS, ERC20_ABI, signer);
  const UNI: Contract = new Contract(UNI_ADDRESS, ERC20_ABI, signer);

  // shoud use oracle price
  let amountTotal: BigNumber = utils.parseUnits("0.15");
  let amountIn: BigNumber = utils.parseUnits("0.049975");
  let amountOut: BigNumber = utils.parseUnits("0.0");
  let deadline: BigNumber = BigNumber.from(
    Math.round(Date.now() / 1000) + 60 * 20
  );

  const aggregateParams = [
    ETH_ADDRESS,
    UNI_ADDRESS,
    amountTotal,
    [
      {
        dexType: 0,
        addressToApprove: UNIV2_ROUTER_ADDRESS,
        exchangeTarget: UNIV2_ROUTER_ADDRESS,
        path: [WETH_ADDRESS, UNI_ADDRESS],
        amountIn: amountIn,
        amountOut: amountOut,
        networkFee: "3000",
        deadline: deadline,
      },
      {
        dexType: 1,
        addressToApprove: UNIV3_ROUTER_ADDRESS,
        exchangeTarget: UNIV3_ROUTER_ADDRESS,
        path: [WETH_ADDRESS, UNI_ADDRESS],
        amountIn: amountIn,
        amountOut: amountOut,
        networkFee: "3000",
        deadline: deadline,
      },
    ],
    { value: amountTotal },
  ];

  console.log(aggregateParams);

  // if (allowanceUNI.lt(amountTotal)) {
  //   console.log("forbitspaceX UNI approving...");
  //   const txApprove = await UNI.approve(
  //     FORBITSPACEX_ADDRESS,
  //     constants.MaxUint256
  //   );
  //   await txApprove.wait();
  //   console.log("UNI Approved >>>", allowanceUNI.toHexString());
  // }

  console.log("Calling...");

  const [estimateGas, results] = await Promise.all([
    forbitspaceX.estimateGas.aggregate(...aggregateParams),
    forbitspaceX.callStatic.aggregate(...aggregateParams),
  ]);

  console.log("estimateGas >>>", estimateGas.toString());
  console.log("results >>>", results);

  const tx = await forbitspaceX.aggregate(...aggregateParams);
  await tx.wait();
  console.log(tx);

  // const collectTokens = await forbitspaceX.callStatic.collectTokens(
  //   WETH_ADDRESS
  // );
  // console.log("collectTokens >>>", collectTokens.toString());
  // const collectETH = await forbitspaceX.callStatic.collectETH();
  // console.log("collectETH >>>", collectETH.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
