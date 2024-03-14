import CONSTANTS from "@/constants";
import BigNumber from "bignumber.js";
import { PrimitiveAtom, atom } from "jotai";
import { atomWithQuery } from 'jotai-tanstack-query'
import EkuboAtoms from "./ekobu.store";
import JediAtoms from "./jedi.store";

export enum Category {
    Stable = "Stable Pools",
    STRK = "STRK Pools",
    Others = "Others"
}

export interface APRSplit {
    apr: number,
    title: string,
    description: string
}

export interface PoolInfo {
    name: string,
    protocol: {
        name: string,
        link: string,
        logo: string
    },
    tvl: number,
    apr: number, // not in %
    aprSplits: APRSplit[],
    category: Category
}

export const StrkDexIncentivesAtom = atomWithQuery((get) => ({
    queryKey: ['strk_dex_incentives'],
    queryFn: async ({ queryKey: [] }) => {
        const res = await fetch(CONSTANTS.EKUBO.INCENTIVE_URL); // common for all
        return res.json()
    },
}))

export const allPools = atom((get) => {
    const ekubo = get(EkuboAtoms.pools);
    const jedi = get(JediAtoms.pools);
    const all = jedi.concat(ekubo)
    all.sort((a, b) => b.apr - a.apr);
    return all;
})