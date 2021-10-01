import { ethers } from "hardhat";
import { Contract, BigNumber, utils } from "ethers";

import {
  abi as FORBITSPACE_ABI,
  address as FORBITSPACE_ADDRESS,
} from "../abis/ForbitSpace.json";
import { abi as WETH_ABI } from "../abis/IWETH.json";
import { abi as ERC20_ABI } from "../abis/IERC20.json";
import { abi as ROUTER_V2_ABI } from "../abis/IUniswapV2Router02.json";

import {
  WETH_ADDRESS,
  UNI_ADDRESS,
  UNIV2_ROUTER_ADDRESS,
  SUSHI_ROUTER_ADDRESS,
} from "./constants/addresses";

import { MAX_UINT256 } from "./constants/hex";

import { CallData } from "./types/call_data_ethers";

async function main() {
  const [signer] = await ethers.getSigners();

  const WETH: Contract = new Contract(WETH_ADDRESS, WETH_ABI, signer);
  const forbitspace: Contract = new Contract(
    FORBITSPACE_ADDRESS,
    FORBITSPACE_ABI,
    signer
  );
  const sushiRouter: Contract = new Contract(
    SUSHI_ROUTER_ADDRESS,
    ROUTER_V2_ABI,
    signer
  );
  const uniV2Router: Contract = new Contract(
    UNIV2_ROUTER_ADDRESS,
    ROUTER_V2_ABI,
    signer
  );

  const iERC20 = new utils.Interface(ERC20_ABI);
  const iRouter = new utils.Interface(ROUTER_V2_ABI);

  // shoud use oracle price
  let amountTotal: string = utils.parseUnits("0.1").toHexString();
  let amountIn: string = utils.parseUnits("0.049975").toHexString();
  let amountOut: string = utils.parseUnits("0.02").toHexString();
  let deadline: string = BigNumber.from(
    Math.round(Date.now() / 1000) + 60 * 20
  ).toHexString();

  let swapExactTokensForTokens_EncodeABI = iRouter.encodeFunctionData(
    "swapExactTokensForTokens",
    [amountIn, amountOut, [WETH_ADDRESS, UNI_ADDRESS], signer.address, deadline]
  );
  let swapTokensForExactTokens_EncodeABI = iRouter.encodeFunctionData(
    "swapTokensForExactTokens",
    [amountOut, amountIn, [WETH_ADDRESS, UNI_ADDRESS], signer.address, deadline]
  );

  let datas: CallData[] = [
    {
      target: UNIV2_ROUTER_ADDRESS,
      // callData: swapTokensForExactTokens_EncodeABI,
      callData: swapExactTokensForTokens_EncodeABI,
    },
    {
      target: SUSHI_ROUTER_ADDRESS,
      // callData: swapTokensForExactTokens_EncodeABI,
      callData: swapExactTokensForTokens_EncodeABI,
    },
  ];

  const allowance: BigNumber = await WETH.allowance(
    signer.address,
    FORBITSPACE_ADDRESS
  );

  if (allowance.toHexString() < amountTotal) {
    console.log("forbitspace approving...");
    await WETH.approve(FORBITSPACE_ADDRESS, MAX_UINT256);
  }
  console.log("Approved");

  const [uniAllow, sushiAllow]: boolean[] = await Promise.all([
    forbitspace.allowance(UNIV2_ROUTER_ADDRESS),
    forbitspace.allowance(SUSHI_ROUTER_ADDRESS),
  ]);

  // only owner
  if (!(uniAllow && sushiAllow)) {
    console.log("Setting allow...");
    if (!uniAllow) {
      const txUniAllow = await forbitspace.setAllowance(
        UNIV2_ROUTER_ADDRESS,
        true
      );
      await txUniAllow.wait();
    }
    if (!sushiAllow) {
      const txSushiAllow = await forbitspace.setAllowance(
        SUSHI_ROUTER_ADDRESS,
        true
      );
      await txSushiAllow.wait();
    }
  }
  console.log("Allowed");

  console.log("Calling...");

  const results = await forbitspace.callStatic.aggregateSwap(
    WETH_ADDRESS,
    amountTotal,
    datas
  );

  const resultsETH = await forbitspace.callStatic.aggregateSwapETH(datas, {
    value: amountTotal,
  });

  console.log("results >>>", resultsETH);
  console.log("");
  console.log("Amount Left >>>", utils.formatUnits(results.amountLeft));

  resultsETH.retAmounts.forEach((retAmount: BigNumber[]) => {
    console.log("");
    console.log(
      `Amount In >>> ${utils.formatUnits(
        retAmount[0]
      )}  Amount Out >>> ${utils.formatUnits(retAmount[1])}`
    );
  });

  const estimateGas = await forbitspace.estimateGas.aggregateSwapETH(datas, {
    value: amountTotal,
  });
  console.log("estimateGas >>>", estimateGas.toString());

  // const tx = await forbitspace.aggregateSwapETH(datas, {
  //   value: amountTotal,
  // });
  // console.log("tx >>>", tx);
  // const tx_wait = await tx.wait();
  // console.log("tx_wait >>>", tx_wait);

  // only owner
  const collectTokens = await forbitspace.callStatic.collectTokens(
    WETH_ADDRESS
  );
  console.log("collectTokens >>>", collectTokens.toString());
  const collectETH = await forbitspace.callStatic.collectETH();
  console.log("collectETH >>>", collectETH.toString());

  // const txCollectFee = await forbitspace.collectTokens(WETH_ADDRESS);
  // console.log("txCollectFee >>>", txCollectFee);
  // const txCollectFee_wait = await txCollectFee.wait();
  // console.log("txCollectFee_wait >>>", txCollectFee_wait);

  // const txCollectFeeETH = await forbitspace.collectETH();
  // console.log("txCollectFeeETH >>>", txCollectFeeETH);
  // const txCollectFeeETH_wait = await txCollectFeeETH.wait();
  // console.log("txCollectFeeETH_wait >>>", txCollectFeeETH_wait);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
