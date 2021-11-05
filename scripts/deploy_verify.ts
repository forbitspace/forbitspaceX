import { deploy } from "./deploy";
import { verify } from "./verify";

// export const PROXY_ADDRESS = "0xDD0740b93194Ab4217511F02D4CE83E5Bd9113De"; // Transparent
export const PROXY_ADDRESS = "0x9F9e837C86081B4b42A21900c6937760A7125212"; // UUPS
export const isUUPS: boolean = true;
export const feeTo: string = "";

deploy(isUUPS, feeTo)
  .then((PROXY_ADDRESS) => {
    console.log({ PROXY_ADDRESS });
    return verify(PROXY_ADDRESS);
  })
  .then(() => {
    console.log("success");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
