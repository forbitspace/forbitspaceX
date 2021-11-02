import { ethers } from "hardhat";
import { Contract, BigNumber, BigNumberish, utils, constants } from "ethers";

import { abi as ERC20_ABI } from "../abis/IERC20.json";
import { abi as ROUTER_V2_ABI } from "../abis/IUniswapV2Router02.json";
import { abi as ROUTER_V3_ABI } from "../abis/ISwapRouter.json";

import {
  WETH_ADDRESSES,
  UNI_ADDRESS,
  SUSHI_ROUTER_ADDRESS,
  UNIV2_ROUTER_ADDRESS,
  UNIV3_ROUTER_ADDRESS,
  ETH_ADDRESS,
} from "./constants/addresses";

import { ChainId } from "./constants/chain_id";

const enum DexType {
  UNI_V2,
  UNI_V3,
}

const enum Fee {
  LOW = "500",
  MEDIUM = "3000",
  HIGH = "10000",
}

type AggregateParam = {
  tokenIn: string;
  tokenOut: string;
  amountInTotal: BigNumberish;
  recipient: string;
  sParams: SwapParam[];
};

type SwapParam = {
  addressToApprove: string;
  exchangeTarget: string;
  tokenIn: string; // tokenFrom
  tokenOut: string; // tokenTo
  swapData: string;
};

// const FORBITSPACEX_ADDRESS = "0xcF1dCaFFf703Fa0219AB779221A14aa5C39c945f";
const FORBITSPACEX_ADDRESS = "0x71fd6e25C1f39263b334eE188DC0d4C4d36E4779";

async function main() {
  const [signer] = await ethers.getSigners();
  const chainId: ChainId = await signer.getChainId();

  const IERC20 = new utils.Interface(ERC20_ABI);

  const WETH_ADDRESS = WETH_ADDRESSES[chainId];

  const WETH: Contract = new Contract(WETH_ADDRESS, IERC20, signer);
  const UNI: Contract = new Contract(UNI_ADDRESS, IERC20, signer);

  const forbitspaceX: Contract = await ethers.getContractAt(
    "forbitspaceX",
    FORBITSPACEX_ADDRESS,
    signer
  );

  // shoud use oracle price
  let amountTotal: BigNumber = utils.parseUnits("0.15");
  let amountIn: BigNumber = utils.parseUnits("0.05");
  let amountOut: BigNumber = utils.parseUnits("0.0");
  let deadline: BigNumber = BigNumber.from(
    Math.round(Date.now() / 1000) + 60 * 20
  );

  const data_WETH_UNI_Sushi = getSwapData(
    DexType.UNI_V2,
    SUSHI_ROUTER_ADDRESS,
    SUSHI_ROUTER_ADDRESS,
    WETH_ADDRESS,
    UNI_ADDRESS,
    amountIn,
    amountOut,
    deadline,
    Fee.MEDIUM
  );

  const data_WETH_UNI_UniV2 = getSwapData(
    DexType.UNI_V2,
    UNIV2_ROUTER_ADDRESS,
    UNIV2_ROUTER_ADDRESS,
    WETH_ADDRESS,
    UNI_ADDRESS,
    amountIn,
    amountOut,
    deadline,
    Fee.MEDIUM
  );

  const data_WETH_UNI_UniV3 = getSwapData(
    DexType.UNI_V3,
    UNIV3_ROUTER_ADDRESS,
    UNIV3_ROUTER_ADDRESS,
    WETH_ADDRESS,
    UNI_ADDRESS,
    amountIn,
    amountOut,
    deadline,
    Fee.MEDIUM
  );

  const data_UNI_WETH_Sushi = getSwapData(
    DexType.UNI_V2,
    SUSHI_ROUTER_ADDRESS,
    SUSHI_ROUTER_ADDRESS,
    UNI_ADDRESS,
    WETH_ADDRESS,
    amountIn,
    amountOut,
    deadline,
    Fee.MEDIUM
  );

  const data_UNI_WETH_UniV2 = getSwapData(
    DexType.UNI_V2,
    UNIV2_ROUTER_ADDRESS,
    UNIV2_ROUTER_ADDRESS,
    UNI_ADDRESS,
    WETH_ADDRESS,
    amountIn,
    amountOut,
    deadline,
    Fee.MEDIUM
  );

  const data_UNI_WETH_UniV3 = getSwapData(
    DexType.UNI_V3,
    UNIV3_ROUTER_ADDRESS,
    UNIV3_ROUTER_ADDRESS,
    UNI_ADDRESS,
    WETH_ADDRESS,
    amountIn,
    amountOut,
    deadline,
    Fee.MEDIUM
  );

  const aggregateParams_ET: AggregateParam = {
    tokenIn: ETH_ADDRESS,
    tokenOut: UNI_ADDRESS,
    amountInTotal: amountTotal,
    recipient: signer.address,
    sParams: [data_WETH_UNI_Sushi, data_WETH_UNI_UniV2, data_WETH_UNI_UniV3],
  };

  const aggregateParams_TT: AggregateParam = {
    tokenIn: UNI_ADDRESS,
    tokenOut: WETH_ADDRESS,
    amountInTotal: amountTotal,
    recipient: signer.address,
    sParams: [data_UNI_WETH_Sushi, data_UNI_WETH_UniV2, data_UNI_WETH_UniV3],
  };

  const aggregateParams_TE: AggregateParam = {
    tokenIn: UNI_ADDRESS,
    tokenOut: ETH_ADDRESS,
    amountInTotal: amountTotal,
    recipient: signer.address,
    sParams: [data_UNI_WETH_Sushi, data_UNI_WETH_UniV2, data_UNI_WETH_UniV3],
  };

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
    forbitspaceX.estimateGas.aggregate(aggregateParams_ET, {
      value: amountTotal,
    }),
    forbitspaceX.estimateGas.aggregate(aggregateParams_TT),
    forbitspaceX.estimateGas.aggregate(aggregateParams_TE),

    forbitspaceX.callStatic.aggregate(aggregateParams_ET, {
      value: amountTotal,
    }),
    forbitspaceX.callStatic.aggregate(aggregateParams_TT),
    forbitspaceX.callStatic.aggregate(aggregateParams_TE),
  ]);

  console.log("estimateGas_ET >>>", estimateGas_ET.toString());
  console.log("estimateGas_TT >>>", estimateGas_TT.toString());
  console.log("estimateGas_TE >>>", estimateGas_TE.toString());

  console.log("results_ET >>>", results_ET);
  console.log("results_TT >>>", results_TT);
  console.log("results_TE >>>", results_TE);

  // const tx_ET = await forbitspaceX.aggregate(aggregateParams_ET, {
  //   value: amountTotal,
  // });
  // await tx_ET.wait();
  // console.log(tx_ET);

  // const tx_TT = await forbitspaceX.aggregate(aggregateParams_TT);
  // await tx_TT.wait();
  // console.log(tx_TT);

  // const tx_TE = await forbitspaceX.aggregate(aggregateParams_TE);
  // await tx_TE.wait();

  // const collectTokens = await forbitspaceX.callStatic.collectTokens(
  //   WETH_ADDRESS
  // );
  // console.log("collectTokens >>>", collectTokens.toString());
  // const collectETH = await forbitspaceX.callStatic.collectETH();
  // console.log("collectETH >>>", collectETH.toString());
}

function getSwapData(
  type: DexType,
  addressToApprove: string,
  exchangeTarget: string,
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumberish,
  amountOut: BigNumberish,
  deadline: BigNumberish,
  fee: Fee
): SwapParam {
  var encode: string;

  switch (type) {
    case DexType.UNI_V2:
      encode = new utils.Interface(ROUTER_V2_ABI).encodeFunctionData(
        "swapExactTokensForTokens",
        [
          amountIn,
          amountOut,
          [tokenIn, tokenOut],
          FORBITSPACEX_ADDRESS,
          deadline,
        ]
      );
      break;
    case DexType.UNI_V3:
      encode = new utils.Interface(ROUTER_V3_ABI).encodeFunctionData(
        "exactInputSingle",
        [
          {
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            fee: fee,
            recipient: FORBITSPACEX_ADDRESS,
            deadline: deadline,
            amountIn: amountIn,
            amountOutMinimum: amountOut,
            sqrtPriceLimitX96: "0x00",
          },
        ]
      );
      break;
    default:
      encode = "";
      break;
  }

  return {
    addressToApprove: addressToApprove,
    exchangeTarget: exchangeTarget,
    tokenIn: tokenIn, // tokenFrom
    tokenOut: tokenOut, // tokenTo
    swapData: encode,
  };
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
