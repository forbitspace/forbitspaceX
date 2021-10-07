import { ethers } from "hardhat";
import { Contract, BigNumber, utils } from "ethers";

import {
  abi as FORBITSPACEX_ABI,
  address as FORBITSPACEX_ADDRESS,
} from "../abis/forbitspaceX.json";
import { abi as ERC20_ABI } from "../abis/IERC20.json";
import { abi as ROUTER_V2_ABI } from "../abis/IUniswapV2Router02.json";
import { abi as ROUTER_V3_ABI } from "../abis/ISwapRouter.json";

import {
  ZERO_ADDRESS,
  WETH_ADDRESS,
  UNI_ADDRESS,
  SUSHI_ROUTER_ADDRESS,
  UNIV2_ROUTER_ADDRESS,
  UNIV3_ROUTER_ADDRESS,
} from "./constants/addresses";

import { MAX_UINT256 } from "./constants/hex";

import { SwapParam } from "./types/SwapParam";

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
      amountIn,
      amountOut,
      deadline,
      WETH_ADDRESS,
      UNI_ADDRESS,
      SUSHI_ROUTER_ADDRESS,
      IRouterV2,
      IERC20,
      signer
    ),
    getSwapData(
      amountIn,
      amountOut,
      deadline,
      WETH_ADDRESS,
      UNI_ADDRESS,
      UNIV2_ROUTER_ADDRESS,
      IRouterV2,
      IERC20,
      signer
    ),
    getSwapData(
      amountIn,
      amountOut,
      deadline,
      WETH_ADDRESS,
      UNI_ADDRESS,
      UNIV3_ROUTER_ADDRESS,
      IRouterV3,
      IERC20,
      signer
    ),
    getSwapData(
      amountIn,
      amountOut,
      deadline,
      UNI_ADDRESS,
      WETH_ADDRESS,
      SUSHI_ROUTER_ADDRESS,
      IRouterV2,
      IERC20,
      signer
    ),
    getSwapData(
      amountIn,
      amountOut,
      deadline,
      UNI_ADDRESS,
      WETH_ADDRESS,
      UNIV2_ROUTER_ADDRESS,
      IRouterV2,
      IERC20,
      signer
    ),
    getSwapData(
      amountIn,
      amountOut,
      deadline,
      UNI_ADDRESS,
      WETH_ADDRESS,
      UNIV3_ROUTER_ADDRESS,
      IRouterV3,
      IERC20,
      signer
    ),
  ]);

  const aggregateParams_ET = [
    ZERO_ADDRESS,
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
    ZERO_ADDRESS,
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

  if (allowanceWETH < amountTotal) {
    console.log("forbitspaceX WETH approving...");
    const txApprove = await WETH.approve(FORBITSPACEX_ADDRESS, MAX_UINT256);
    await txApprove.wait();
    console.log("WETH Approved >>>", allowanceWETH.toHexString());
  }

  if (allowanceUNI < amountTotal) {
    console.log("forbitspaceX UNI approving...");
    const txApprove = await UNI.approve(FORBITSPACEX_ADDRESS, MAX_UINT256);
    await txApprove.wait();
    console.log("UNI Approved >>>", allowanceUNI.toHexString());
  }

  console.log("Calling...");

  const [
    results_ET,
    results_TT,
    results_TE,

    estimateGas_ET,
    estimateGas_TT,
    estimateGas_TE,
  ] = await Promise.all([
    forbitspaceX.callStatic.aggregate(...aggregateParams_ET),
    forbitspaceX.callStatic.aggregate(...aggregateParams_TT),
    forbitspaceX.callStatic.aggregate(...aggregateParams_TE),

    forbitspaceX.estimateGas.aggregate(...aggregateParams_ET),
    forbitspaceX.estimateGas.aggregate(...aggregateParams_TT),
    forbitspaceX.estimateGas.aggregate(...aggregateParams_TE),
  ]);

  console.log("estimateGas_ET >>>", estimateGas_ET.toString());
  console.log("estimateGas_TT >>>", estimateGas_TT.toString());
  console.log("estimateGas_TE >>>", estimateGas_TE.toString());

  console.log("results_ET >>>", results_ET);
  console.log("results_TT >>>", results_TT);
  console.log("results_TE >>>", results_TE);

  // const collectTokens = await forbitspaceX.callStatic.collectTokens(
  //   WETH_ADDRESS
  // );
  // console.log("collectTokens >>>", collectTokens.toString());
  // const collectETH = await forbitspaceX.callStatic.collectETH();
  // console.log("collectETH >>>", collectETH.toString());
}

async function getSwapData(
  amountIn: BigNumber,
  amountOut: BigNumber,
  deadline: BigNumber,
  tokenInAddress: string,
  tokenOutAddress: string,
  routerAddress: string,
  IRouter: utils.Interface,
  IERC20: utils.Interface,
  signer: any
): Promise<SwapParam[]> {
  var swapParam: SwapParam;

  const token = new Contract(tokenInAddress, IERC20, signer);
  const allowance: BigNumber = await token.allowance(
    FORBITSPACEX_ADDRESS,
    routerAddress
  );

  const approveParam: SwapParam = {
    target: tokenInAddress,
    swapData: IERC20.encodeFunctionData("approve", [routerAddress, amountIn]),
  };

  IRouter.fragments.forEach((element: utils.Fragment) => {});
  const i = IRouter.fragments
    .map((fragment: utils.Fragment) => fragment.name)
    .indexOf("swapExactTokensForTokens");

  if (i != -1) {
    console.log("swapExactTokensForTokens");
    swapParam = {
      target: routerAddress,
      swapData: IRouter.encodeFunctionData("swapExactTokensForTokens", [
        amountIn.toHexString(),
        amountOut.toHexString(),
        [tokenInAddress, tokenOutAddress],
        FORBITSPACEX_ADDRESS,
        deadline.toHexString(),
      ]),
    };
  } else {
    console.log("exactInputSingle");
    swapParam = {
      target: routerAddress,
      swapData: IRouter.encodeFunctionData("exactInputSingle", [
        {
          tokenIn: tokenInAddress,
          tokenOut: tokenOutAddress,
          fee: "3000",
          recipient: FORBITSPACEX_ADDRESS,
          deadline: deadline.toHexString(),
          amountIn: amountIn.toHexString(),
          amountOutMinimum: amountOut.toHexString(),
          sqrtPriceLimitX96: "0x00",
        },
      ]),
    };
  }

  return allowance.lt(amountIn) ? [approveParam, swapParam] : [swapParam];
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
