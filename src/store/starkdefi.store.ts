import { PoolInfo, ProtocolAtoms, StrkDexIncentivesAtom } from './pools';
import { atom } from 'jotai';
import { Jediswap } from './jedi.store';

export class StarkDefi extends Jediswap {
  name = 'StarkDefi';
  link = 'https://app.starkdefi.com/#/pool';
  logo =
    'https://static-assets-8zct.onrender.com/integrations/starkdefi/starkdefi.png';

  incentiveDataKey = 'StarkDefi';
}

export const starkDefi = new StarkDefi();
const StarkDefiAtoms: ProtocolAtoms = {
  pools: atom((get) => {
    const poolsInfo = get(StrkDexIncentivesAtom);
    const empty: PoolInfo[] = [];
    if (poolsInfo.data) return starkDefi._computePoolsInfo(poolsInfo.data);
    return empty;
  }),
};
export default StarkDefiAtoms;
