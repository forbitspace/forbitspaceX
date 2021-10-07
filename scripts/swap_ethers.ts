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

  const WETH: Contract = new Contract(WETH_ADDRESS, ERC20_ABI, signer);
  const UNI: Contract = new Contract(UNI_ADDRESS, ERC20_ABI, signer);
  const forbitspaceX: Contract = new Contract(
    FORBITSPACEX_ADDRESS,
    FORBITSPACEX_ABI,
    signer
  );

  const iERC20 = new utils.Interface(ERC20_ABI);
  const iRouterV2 = new utils.Interface(ROUTER_V2_ABI);
  const iRouterV3 = new utils.Interface(ROUTER_V3_ABI);

  // shoud use oracle price
  let amountTotal: string = utils.parseUnits("0.15").toHexString();
  let amountIn: string = utils.parseUnits("0.049975").toHexString();
  let amountOut: string = utils.parseUnits("0.0").toHexString();
  let deadline: string = BigNumber.from(
    Math.round(Date.now() / 1000) + 60 * 20
  ).toHexString();

  const swapExactTokensForTokens_Encode = iRouterV2.encodeFunctionData(
    "swapExactTokensForTokens",
    [
      amountIn,
      amountOut,
      [WETH_ADDRESS, UNI_ADDRESS],
      FORBITSPACEX_ADDRESS,
      deadline,
    ]
  );

  const exactInputSingle_Encode = iRouterV3.encodeFunctionData(
    "exactInputSingle",
    [
      {
        tokenIn: WETH_ADDRESS,
        tokenOut: UNI_ADDRESS,
        fee: "3000",
        recipient: FORBITSPACEX_ADDRESS,
        deadline: deadline,
        amountIn: amountIn,
        amountOutMinimum: amountOut,
        sqrtPriceLimitX96: "0x00",
      },
    ]
  );

  const approveSushi_Encode = iERC20.encodeFunctionData("approve", [
    SUSHI_ROUTER_ADDRESS,
    MAX_UINT256,
  ]);
  const approveUniV2_Encode = iERC20.encodeFunctionData("approve", [
    UNIV2_ROUTER_ADDRESS,
    MAX_UINT256,
  ]);
  const approveUniV3_Encode = iERC20.encodeFunctionData("approve", [
    UNIV3_ROUTER_ADDRESS,
    MAX_UINT256,
  ]);

  var swapParams: SwapParam[] = [
    {
      target: WETH_ADDRESS,
      swapData: approveSushi_Encode,
    },
    {
      target: WETH_ADDRESS,
      swapData: approveUniV2_Encode,
    },
    {
      target: WETH_ADDRESS,
      swapData: approveUniV3_Encode,
    },
    {
      target: SUSHI_ROUTER_ADDRESS,
      swapData: swapExactTokensForTokens_Encode,
    },
    {
      target: UNIV2_ROUTER_ADDRESS,
      swapData: swapExactTokensForTokens_Encode,
    },
    {
      target: UNIV3_ROUTER_ADDRESS,
      swapData: exactInputSingle_Encode,
    },
  ];

  const allowance: BigNumber = await WETH.allowance(
    signer.address,
    FORBITSPACEX_ADDRESS
  );

  if (allowance.toHexString() < amountTotal) {
    console.log("forbitspaceX approving...");
    await WETH.approve(FORBITSPACEX_ADDRESS, MAX_UINT256);
  }
  console.log("Approved >>>", allowance.toHexString());

  console.log("Calling...");

  const aggregateParams = [WETH_ADDRESS, UNI_ADDRESS, amountTotal, swapParams];

  const aggregateETHParams = [
    ZERO_ADDRESS,
    UNI_ADDRESS,
    amountTotal,
    swapParams,
    { value: amountTotal },
  ];

  const [results, resultsETH, estimateGas, estimateGasETH] = await Promise.all([
    forbitspaceX.callStatic.aggregate(...aggregateParams),
    forbitspaceX.callStatic.aggregate(...aggregateETHParams),
    forbitspaceX.estimateGas.aggregate(...aggregateParams),
    forbitspaceX.estimateGas.aggregate(...aggregateETHParams),
  ]);

  console.log("estimateGas >>>", estimateGas.toString());
  console.log("estimateGasETH >>>", estimateGasETH.toString());
  console.log("results >>>", results);
  console.log("resultsETH >>>", resultsETH);

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
