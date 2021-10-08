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
  address as FORBITSPACEX_ADDRESS,
} from "../abis/forbitspaceX.json";
import { abi as ERC20_ABI } from "../abis/IERC20.json";
import { abi as ROUTER_V2_ABI } from "../abis/IUniswapV2Router02.json";
import { abi as ROUTER_V3_ABI } from "../abis/ISwapRouter.json";

import {
  WETH_ADDRESS,
  UNI_ADDRESS,
  SUSHI_ROUTER_ADDRESS,
  UNIV2_ROUTER_ADDRESS,
  UNIV3_ROUTER_ADDRESS,
} from "./constants/addresses";

import { SwapParam } from "./types/SwapParam";

type SwapArgs = {
  amountIn: BigNumber;
  amountOut: BigNumber;
  deadline: BigNumber;
  tokenInAddress: string;
  tokenOutAddress: string;
  fee: string;
};

async function main() {
  const [signer] = await ethers.getSigners();
  const IERC20 = new utils.Interface(ERC20_ABI);
  const IRouterV2 = new utils.Interface(ROUTER_V2_ABI);
  const IRouterV3 = new utils.Interface(ROUTER_V3_ABI);

  const WETH: Contract = new Contract(WETH_ADDRESS, IERC20, signer);
  const UNI: Contract = new Contract(UNI_ADDRESS, IERC20, signer);
  const forbitspaceX: Contract = new Contract(
    FORBITSPACEX_ADDRESS,
    FORBITSPACEX_ABI,
    signer
  );

  // shoud use oracle price
  let amountTotal: BigNumber = utils.parseUnits("0.15");
  let amountIn: BigNumber = utils.parseUnits("0.049975");
  let amountOut: BigNumber = utils.parseUnits("0.0");
  let deadline: BigNumber = BigNumber.from(
    Math.round(Date.now() / 1000) + 60 * 20
  );

  const [
    data_WETH_UNI_Sushi,
    data_WETH_UNI_UniV2,
    data_WETH_UNI_UniV3,
    data_UNI_WETH_Sushi,
    data_UNI_WETH_UniV2,
    data_UNI_WETH_UniV3,
  ] = await Promise.all([
    getSwapData(
      {
        amountIn,
        amountOut,
        deadline,
        tokenInAddress: WETH_ADDRESS,
        tokenOutAddress: UNI_ADDRESS,
        fee: "3000",
      },
      SUSHI_ROUTER_ADDRESS,
      IRouterV2,
      IERC20
    ),
    getSwapData(
      {
        amountIn,
        amountOut,
        deadline,
        tokenInAddress: WETH_ADDRESS,
        tokenOutAddress: UNI_ADDRESS,
        fee: "3000",
      },
      UNIV2_ROUTER_ADDRESS,
      IRouterV2,
      IERC20
    ),
    getSwapData(
      {
        amountIn,
        amountOut,
        deadline,
        tokenInAddress: WETH_ADDRESS,
        tokenOutAddress: UNI_ADDRESS,
        fee: "3000",
      },
      UNIV3_ROUTER_ADDRESS,
      IRouterV3,
      IERC20
    ),
    getSwapData(
      {
        amountIn,
        amountOut,
        deadline,
        tokenInAddress: UNI_ADDRESS,
        tokenOutAddress: WETH_ADDRESS,
        fee: "3000",
      },
      SUSHI_ROUTER_ADDRESS,
      IRouterV2,
      IERC20
    ),
    getSwapData(
      {
        amountIn,
        amountOut,
        deadline,
        tokenInAddress: UNI_ADDRESS,
        tokenOutAddress: WETH_ADDRESS,
        fee: "3000",
      },
      UNIV2_ROUTER_ADDRESS,
      IRouterV2,
      IERC20
    ),
    getSwapData(
      {
        amountIn,
        amountOut,
        deadline,
        tokenInAddress: UNI_ADDRESS,
        tokenOutAddress: WETH_ADDRESS,
        fee: "3000",
      },
      UNIV3_ROUTER_ADDRESS,
      IRouterV3,
      IERC20
    ),
  ]);

  const aggregateParams_ET = [
    constants.AddressZero,
    UNI_ADDRESS,
    amountTotal,
    [...data_WETH_UNI_Sushi, ...data_WETH_UNI_UniV2, ...data_WETH_UNI_UniV3],
    { value: amountTotal },
  ];

  const aggregateParams_TT = [
    UNI_ADDRESS,
    WETH_ADDRESS,
    amountTotal,
    [...data_UNI_WETH_Sushi, ...data_UNI_WETH_UniV2, ...data_UNI_WETH_UniV3],
  ];

  const aggregateParams_TE = [
    UNI_ADDRESS,
    constants.AddressZero,
    amountTotal,
    [...data_UNI_WETH_Sushi, ...data_UNI_WETH_UniV2, ...data_UNI_WETH_UniV3],
  ];

  const allowanceWETH: BigNumber = await WETH.allowance(
    signer.address,
    FORBITSPACEX_ADDRESS
  );

  const allowanceUNI: BigNumber = await UNI.allowance(
    signer.address,
    FORBITSPACEX_ADDRESS
  );

  if (allowanceWETH.lt(amountTotal)) {
    console.log("forbitspaceX WETH approving...");
    const txApprove = await WETH.approve(
      FORBITSPACEX_ADDRESS,
      constants.MaxUint256
    );
    await txApprove.wait();
    console.log("WETH Approved >>>", allowanceWETH.toHexString());
  }

  if (allowanceUNI.lt(amountTotal)) {
    console.log("forbitspaceX UNI approving...");
    const txApprove = await UNI.approve(
      FORBITSPACEX_ADDRESS,
      constants.MaxUint256
    );
    await txApprove.wait();
    console.log("UNI Approved >>>", allowanceUNI.toHexString());
  }

  console.log("Calling...");

  const [
    estimateGas_ET,
    estimateGas_TT,
    estimateGas_TE,

    results_ET,
    results_TT,
    results_TE,
  ] = await Promise.all([
    forbitspaceX.estimateGas.aggregate(...aggregateParams_ET),
    forbitspaceX.estimateGas.aggregate(...aggregateParams_TT),
    forbitspaceX.estimateGas.aggregate(...aggregateParams_TE),

    forbitspaceX.callStatic.aggregate(...aggregateParams_ET),
    forbitspaceX.callStatic.aggregate(...aggregateParams_TT),
    forbitspaceX.callStatic.aggregate(...aggregateParams_TE),
  ]);

  console.log("estimateGas_ET >>>", estimateGas_ET.toString());
  console.log("estimateGas_TT >>>", estimateGas_TT.toString());
  console.log("estimateGas_TE >>>", estimateGas_TE.toString());

  console.log("results_ET >>>", results_ET);
  console.log("results_TT >>>", results_TT);
  console.log("results_TE >>>", results_TE);

  // const tx_ET = await forbitspaceX.aggregate(...aggregateParams_ET);
  // await tx_ET.wait();
  // console.log(tx_ET);

  // const tx_TT = await forbitspaceX.aggregate(...aggregateParams_TT);
  // await tx_TT.wait();
  // console.log(tx_TT);

  // const tx_TE = await forbitspaceX.aggregate(...aggregateParams_TE);
  // await tx_TE.wait();
  // console.log(tx_TE);

  // const collectTokens = await forbitspaceX.callStatic.collectTokens(
  //   WETH_ADDRESS
  // );
  // console.log("collectTokens >>>", collectTokens.toString());
  // const collectETH = await forbitspaceX.callStatic.collectETH();
  // console.log("collectETH >>>", collectETH.toString());
}

async function getSwapData(
  swapArgs: SwapArgs,
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
    FORBITSPACEX_ADDRESS,
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
    swapData: getSwapEncode(IRouter, swapArgs) || "",
  };

  return allowance.lt(swapArgs.amountIn)
    ? [approveParam, swapParam]
    : [swapParam];
}

function getSwapEncode(
  IRouter: utils.Interface,
  swapArgs: SwapArgs
): string | undefined {
  try {
    return IRouter.encodeFunctionData("swapExactTokensForTokens", [
      swapArgs.amountIn.toHexString(),
      swapArgs.amountOut.toHexString(),
      [swapArgs.tokenInAddress, swapArgs.tokenOutAddress],
      FORBITSPACEX_ADDRESS,
      swapArgs.deadline.toHexString(),
    ]);
  } catch (error) {}

  try {
    return IRouter.encodeFunctionData("exactInputSingle", [
      {
        tokenIn: swapArgs.tokenInAddress,
        tokenOut: swapArgs.tokenOutAddress,
        fee: swapArgs.fee,
        recipient: FORBITSPACEX_ADDRESS,
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
