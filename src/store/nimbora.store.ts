import { PoolInfo, ProtocolAtoms, StrkLendingIncentivesAtom } from './pools';
import { atom } from 'jotai';
import { ZkLend } from './zklend.store';

export class Nimbora extends ZkLend {
  name = 'Nimbora';
  link = 'https://app.nimbora.io/';
  logo =
    'https://assets-global.website-files.com/64f0518cbb38bb59ddd7a331/64f1ea84a753c1ed93b2c920_faviconn.png';

  incentiveDataKey = 'Nimbora';
}

export const nimbora = new Nimbora();
const NimboraAtoms: ProtocolAtoms = {
  pools: atom((get) => {
    const poolsInfo = get(StrkLendingIncentivesAtom);
    const empty: PoolInfo[] = [];
    if (poolsInfo.data) return nimbora._computePoolsInfo(poolsInfo.data);
    return empty;
  }),
};
export default NimboraAtoms;
