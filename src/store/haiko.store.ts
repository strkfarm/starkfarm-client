'use client';

import { PoolInfo, ProtocolAtoms, StrkDexIncentivesAtom } from './pools';
import { atom } from 'jotai';
import { Ekubo } from './ekobu.store';

export class Haiko extends Ekubo {
  name = 'Haiko';
  link = 'https://app.haiko.xyz/positions';
  logo = 'https://app.haiko.xyz/favicon.ico';
  incentiveDataKey: string = 'Haiko';
}

export const haiko = new Haiko();
const HaikoAtoms: ProtocolAtoms = {
  pools: atom((get) => {
    const poolsInfo = get(StrkDexIncentivesAtom);
    const empty: PoolInfo[] = [];
    if (poolsInfo.data) return haiko._computePoolsInfo(poolsInfo.data);
    return empty;
  }),
};
export default HaikoAtoms;
