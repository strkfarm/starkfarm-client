import CONSTANTS, { TokenName } from "@/constants";
import axios from "axios";
import {
  Category,
  PoolInfo,
  PoolType,
  ProtocolAtoms,
  StrkDexIncentivesAtom,
} from "./pools";
import { Ekubo } from "./ekobu.store";
import { atom } from "jotai";
import { Jediswap } from "./jedi.store";

export class NostraDex extends Jediswap {
  name = "Nostra DEX";
  link = "https://app.nostra.finance/pools";
  logo = "https://app.nostra.finance/favicon.svg";

  incentiveDataKey = "Nostra";
}

export const nostraDex = new NostraDex();
const NostraDexAtoms: ProtocolAtoms = {
  pools: atom((get) => {
    const poolsInfo = get(StrkDexIncentivesAtom);
    const empty: PoolInfo[] = [];
    if (poolsInfo.data) return nostraDex._computePoolsInfo(poolsInfo.data);
    return empty;
  }),
};
export default NostraDexAtoms;
