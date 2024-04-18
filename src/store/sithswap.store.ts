import CONSTANTS, { TokenName } from "@/constants";
import axios from 'axios';
import { Category, PoolInfo, PoolType, ProtocolAtoms, StrkDexIncentivesAtom } from "./pools";
import { Ekubo } from "./ekobu.store";
import { atom } from "jotai";
import { Jediswap } from "./jedi.store";

export class Sithswap extends Jediswap {
    name = 'SithSwap';
    link = 'https://app.sithswap.com/spring/';
    logo = 'https://app.sithswap.com/favicon.png';

    incentiveDataKey = 'Sithswap';
}

export const sithswap = new Sithswap();
const SithswapAtoms: ProtocolAtoms = {
    pools: atom((get) => {
        const poolsInfo = get(StrkDexIncentivesAtom);
        const empty: PoolInfo[] = [];
        if (poolsInfo.data) return sithswap._computePoolsInfo(poolsInfo.data);
        return empty;
    })
};
export default SithswapAtoms;