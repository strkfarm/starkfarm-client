import { PoolInfo, ProtocolAtoms, StrkDexIncentivesAtom } from './pools';
import { atom } from 'jotai';
import { Jediswap } from './jedi.store';

export class TenkSwap extends Jediswap {
  name = '10kSwap';
  link = 'https://10kswap.com/pool';
  logo =
    'https://static-assets-8zct.onrender.com/integrations/10kswap/favicon.png';

  incentiveDataKey = '10kSwap';
}

export const tenkswap = new TenkSwap();
const TenkSwapAtoms: ProtocolAtoms = {
  pools: atom((get) => {
    const poolsInfo = get(StrkDexIncentivesAtom);
    const empty: PoolInfo[] = [];
    if (poolsInfo.data) return tenkswap._computePoolsInfo(poolsInfo.data);
    return empty;
  }),
};
export default TenkSwapAtoms;
