"use client";

import {
  PoolInfo,
  ProtocolAtoms,
  StrkDexIncentivesAtom,
} from "./pools";
import { atom } from "jotai";
import { Ekubo } from "./ekobu.store";
const fetcher = (...args: any[]) => {
  return fetch(args[0], args[1]).then((res) => res.json());
};

export class MySwap extends Ekubo {
  name = "MySwap (v2)";
  link = "https://app.myswap.xyz/#/pools";
  logo = "https://app.myswap.xyz/favicon.ico";
  incentiveDataKey: string = "MySwap";
}

export const mySwap = new MySwap();
const MySwapAtoms: ProtocolAtoms = {
  pools: atom((get) => {
    const poolsInfo = get(StrkDexIncentivesAtom);
    const empty: PoolInfo[] = [];
    if (poolsInfo.data) return mySwap._computePoolsInfo(poolsInfo.data);
    return empty;
  }),
};
export default MySwapAtoms;
