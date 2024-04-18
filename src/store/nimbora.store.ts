import CONSTANTS, { TokenName } from "@/constants";
import axios from 'axios';
import { Category, PoolInfo, PoolType, ProtocolAtoms, StrkDexIncentivesAtom, StrkLendingIncentivesAtom } from "./pools";
import { Ekubo } from "./ekobu.store";
import { atom } from "jotai";
import { Jediswap } from "./jedi.store";
import { ZkLend } from "./zklend.store";

export class Nimbora extends ZkLend {
    name = 'Nimbora';
    link = 'https://app.nimbora.io/';
    logo = 'https://assets-global.website-files.com/64f0518cbb38bb59ddd7a331/64f1ea84a753c1ed93b2c920_faviconn.png';

    incentiveDataKey = 'Nimbora';
}

export const nimbora = new Nimbora();
const NimboraAtoms: ProtocolAtoms = {
    pools: atom((get) => {
        const poolsInfo = get(StrkLendingIncentivesAtom);
        const empty: PoolInfo[] = [];
        if (poolsInfo.data) return nimbora._computePoolsInfo(poolsInfo.data);
        return empty;
    })
};
export default NimboraAtoms;