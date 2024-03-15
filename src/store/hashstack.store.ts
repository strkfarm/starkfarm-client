import CONSTANTS, { TokenName } from "@/constants";
import axios from 'axios'
import { Category, PoolInfo, PoolType, ProtocolAtoms, StrkDexIncentivesAtom, StrkLendingIncentivesAtom } from "./pools";
import { Ekubo } from "./ekobu.store";
import { atom } from "jotai";
import { Jediswap } from "./jedi.store";
import { ZkLend } from "./zklend.store";

export class Hashstack extends ZkLend {
    name = 'Hashstack'
    link = 'https://app.hashstack.finance/'
    logo = 'https://app.hashstack.finance/favicon-32x32.png'

    incentiveDataKey = 'Hashstack'
}


export const hashstack = new Hashstack();
const HashstackAtoms: ProtocolAtoms = {
    pools: atom((get) => {
        const poolsInfo = get(StrkLendingIncentivesAtom)
        const empty: PoolInfo[] = [];
        if (poolsInfo.data) return hashstack._computePoolsInfo(poolsInfo.data);
        else return empty;
    })
}
export default HashstackAtoms;