'use client';

import CONSTANTS from "@/constants";
import axios from 'axios'
import { Category, PoolInfo, PoolType, ProtocolAtoms, StrkDexIncentivesAtom } from "./pools";
import { PrimitiveAtom, atom } from "jotai";
import useSWR from "swr";
import { Ekubo } from "./ekobu.store";

export class Haiko extends Ekubo {
    name = 'Haiko'  
    link = 'https://app.haiko.xyz/positions'
    logo = 'https://app.haiko.xyz/favicon.ico'
    incentiveDataKey: string = 'Haiko'
}

export const haiko = new Haiko();
const HaikoAtoms: ProtocolAtoms = {
    pools: atom((get) => {
        const poolsInfo = get(StrkDexIncentivesAtom)
        const empty: PoolInfo[] = [];
        if (poolsInfo.data) return haiko._computePoolsInfo(poolsInfo.data);
        else return empty;
    })
}
export default HaikoAtoms;