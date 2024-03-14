'use client';

import CONSTANTS from "@/constants";
import axios from 'axios'
import { Category, PoolInfo, PoolType, ProtocolAtoms, StrkDexIncentivesAtom } from "./pools";
import { PrimitiveAtom, atom } from "jotai";
import useSWR from "swr";
import { Ekubo } from "./ekobu.store";
const fetcher = (...args: any[]) => {
    return fetch(args[0], args[1]).then(res => res.json())
}

export class MySwap extends Ekubo {
    name = 'MySwap (v2)'
    link = 'https://app.myswap.xyz/#/pools'
    logo = 'https://app.myswap.xyz/favicon.ico'
    incentiveDataKey: string = 'MySwap'
}

export const mySwap = new MySwap();
const MySwapAtoms: ProtocolAtoms = {
    pools: atom((get) => {
        const poolsInfo = get(StrkDexIncentivesAtom)
        const empty: PoolInfo[] = [];
        if (poolsInfo.data) return mySwap._computePoolsInfo(poolsInfo.data);
        else return empty;
    })
}
export default MySwapAtoms;