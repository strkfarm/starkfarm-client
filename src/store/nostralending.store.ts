import CONSTANTS, { TokenName } from "@/constants";
import axios from 'axios'
import { Category, PoolInfo, PoolType, ProtocolAtoms, StrkDexIncentivesAtom, StrkLendingIncentivesAtom } from "./pools";
import { Ekubo } from "./ekobu.store";
import { atom } from "jotai";
import { Jediswap } from "./jedi.store";
import { ZkLend } from "./zklend.store";

export class NostraLending extends ZkLend {
    name = 'Nostra MM'
    link = 'https://app.nostra.finance/'
    logo = 'https://app.nostra.finance/favicon.svg'

    incentiveDataKey = 'Nostra'
}


export const nostraLending = new NostraLending();
const NostraLendingAtoms: ProtocolAtoms = {
    pools: atom((get) => {
        const poolsInfo = get(StrkLendingIncentivesAtom)
        const empty: PoolInfo[] = [];
        if (poolsInfo.data) return nostraLending._computePoolsInfo(poolsInfo.data);
        else return empty;
    })
}
export default NostraLendingAtoms;