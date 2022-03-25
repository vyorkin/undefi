import { BigNumber } from "ethers";

export const pow = (x: number, y: number) => BigNumber.from(x).pow(y);
