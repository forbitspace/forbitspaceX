import { ethers } from "hardhat";
import {
  Contract,
  BigNumber,
  utils,
  constants,
  getDefaultProvider,
} from "ethers";

import {
  abi as FORBITSPACEX_ABI,
  addresses as FORBITSPACEX_ADDRESSES,
} from "../abis/forbitspaceX.json";
import { abi as ERC20_ABI } from "../abis/IERC20.json";
import { abi as ROUTER_V2_ABI } from "../abis/IUniswapV2Router02.json";
import { abi as ROUTER_V3_ABI } from "../abis/ISwapRouter.json";

import {
  WETH_ADDRESSES,
  UNI_ADDRESS,
  SUSHI_ROUTER_ADDRESS,
  UNIV2_ROUTER_ADDRESS,
  UNIV3_ROUTER_ADDRESS,
} from "./constants/addresses";

import { SwapParam } from "./types/SwapParam";
import { ChainId } from "./constants/chain_id";

type SwapArgs = {
  amountIn: BigNumber;
  amountOut: BigNumber;
  deadline: BigNumber;
  tokenInAddress: string;
  tokenOutAddress: string;
  fee: string;
};

async function main() {
  const ETH_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

  const FORBITSPACEX_ADDRESS = "0xfC8af0CFADA6d9062CA090BB6C00860c0a58e25a";

  const [signer] = await ethers.getSigners();
  const chainId: ChainId = await signer.getChainId();

  const WETH_ADDRESS = WETH_ADDRESSES[chainId];

  const IERC20 = new utils.Interface(ERC20_ABI);
  const IRouterV2 = new utils.Interface(ROUTER_V2_ABI);
  const IRouterV3 = new utils.Interface(ROUTER_V3_ABI);

  const forbitspaceX = await ethers.getContractAt(
    "forbitspaceX",
    FORBITSPACEX_ADDRESS,
    signer
  );

  const WETH: Contract = new Contract(WETH_ADDRESS, IERC20, signer);
  const UNI: Contract = new Contract(UNI_ADDRESS, IERC20, signer);

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

async function getSwapData(
  swapArgs: SwapArgs,
  forbitspaceX_address: string,
  routerAddress: string,
  IRouter: utils.Interface,
  IERC20: utils.Interface
): Promise<SwapParam[]> {
  var swapParam: SwapParam;

  const tokenIn = new Contract(
    swapArgs.tokenInAddress,
    IERC20,
    getDefaultProvider()
  );
  const allowance: BigNumber = await tokenIn.allowance(
    forbitspaceX_address,
    routerAddress
  );

  const approveParam: SwapParam = {
    target: swapArgs.tokenInAddress,
    swapData: IERC20.encodeFunctionData("approve", [
      routerAddress,
      swapArgs.amountIn,
    ]),
  };

  swapParam = {
    target: routerAddress,
    swapData: getSwapEncode(forbitspaceX_address, IRouter, swapArgs) || "",
  };

  return allowance.lt(swapArgs.amountIn)
    ? [approveParam, swapParam]
    : [swapParam];
}

function getSwapEncode(
  forbitspaceX_address: string,
  IRouter: utils.Interface,
  swapArgs: SwapArgs
): string | undefined {
  try {
    return IRouter.encodeFunctionData("swapExactTokensForTokens", [
      swapArgs.amountIn.toHexString(),
      swapArgs.amountOut.toHexString(),
      [swapArgs.tokenInAddress, swapArgs.tokenOutAddress],
      forbitspaceX_address,
      swapArgs.deadline.toHexString(),
    ]);
  } catch (error) {}

  try {
    return IRouter.encodeFunctionData("exactInputSingle", [
      {
        tokenIn: swapArgs.tokenInAddress,
        tokenOut: swapArgs.tokenOutAddress,
        fee: swapArgs.fee,
        recipient: forbitspaceX_address,
        deadline: swapArgs.deadline.toHexString(),
        amountIn: swapArgs.amountIn.toHexString(),
        amountOutMinimum: swapArgs.amountOut.toHexString(),
        sqrtPriceLimitX96: "0x00",
      },
    ]);
  } catch (error) {}

  return undefined;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
