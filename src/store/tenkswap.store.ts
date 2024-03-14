import CONSTANTS, { TokenName } from "@/constants";
import axios from 'axios'
import { Category, PoolInfo, PoolType, ProtocolAtoms, StrkDexIncentivesAtom } from "./pools";
import { Ekubo } from "./ekobu.store";
import { atom } from "jotai";
import { Jediswap } from "./jedi.store";

export class TenkSwap extends Jediswap {
    name = '10kSwap'
    link = 'https://10kswap.com/pool'
    logo = 'https://10kswap.com/favicon.png'

    incentiveDataKey = '10kSwap'
}


export const tenkswap = new TenkSwap();
const TenkSwapAtoms: ProtocolAtoms = {
    pools: atom((get) => {
        const poolsInfo = get(StrkDexIncentivesAtom)
        const empty: PoolInfo[] = [];
        if (poolsInfo.data) return tenkswap._computePoolsInfo(poolsInfo.data);
        else return empty;
    })
}
export default TenkSwapAtoms;