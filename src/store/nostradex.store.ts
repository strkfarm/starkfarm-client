// import { PoolInfo, ProtocolAtoms, StrkDexIncentivesAtom } from './pools';
// import { atom } from 'jotai';
// import { Jediswap } from './jedi.store';

// export class NostraDex extends Jediswap {
//   name = 'Nostra DEX';
//   link = 'https://app.nostra.finance/pools';
//   logo = 'https://app.nostra.finance/favicon.svg';

//   incentiveDataKey = 'Nostra';
// }

// export const nostraDex = new NostraDex();
// const NostraDexAtoms: ProtocolAtoms = {
//   pools: atom((get) => {
//     const poolsInfo = get(StrkDexIncentivesAtom);
//     const empty: PoolInfo[] = [];
//     if (poolsInfo.data) return nostraDex._computePoolsInfo(poolsInfo.data);
//     return empty;
//   }),
// };
// export default NostraDexAtoms;

import CONSTANTS, { TokenName } from '@/constants';
import { Category, PoolType } from './pools';
import { atom } from 'jotai';
import { PoolInfo, ProtocolAtoms, StrkDex2IncentivesAtom } from './pools';
import { Jediswap } from './jedi.store';

export class NostraDex extends Jediswap {
  name = 'Nostra DEX';
  link = 'https://app.nostra.finance/pools';
  logo = 'https://app.nostra.finance/favicon.svg';
  incentiveDataKey = 'isNostraDex';

  _computePoolsInfo(data: any) {
    try {
      const myData = data;
      if (!myData) return [];
      const pools: PoolInfo[] = [];
      Object.entries(myData)
        .filter(([_, poolData]: any) => poolData.isDegen === false)
        .forEach(([poolName, poolData]: any) => {
          const category = Category.Others;
          const tokens: TokenName[] = [poolData.tokenA, poolData.tokenB];
          const logo1 = CONSTANTS.LOGOS[tokens[0]];
          const logo2 = CONSTANTS.LOGOS[tokens[1]];
          const baseApr =
            poolData.baseApr === '0' ? 0.0 : parseFloat(poolData.baseApr);
          const rewardApr = parseFloat(poolData.rewardApr);
          const poolInfo: PoolInfo = {
            pool: {
              name: poolData.id,
              logos: [logo1, logo2],
            },
            protocol: {
              name: this.name,
              link: this.link,
              logo: this.logo,
            },
            apr: baseApr + rewardApr,
            tvl: Number(poolData.tvl),
            aprSplits: [
              {
                apr: baseApr || baseApr.toString() === '' ? baseApr : 0,
                title: 'Base APR',
                description: '',
              },
              {
                apr: rewardApr,
                title: 'Reward APR',
                description: '',
              },
            ],
            category,
            type: PoolType.DEXV2,
            lending: {
              collateralFactor: 0,
            },
            borrow: {
              borrowFactor: 0,
              apr: 0,
            },
          };
          pools.push(poolInfo);
        });
      return pools;
    } catch (err) {
      console.error('Err fetching pools [2]', err);
      throw err;
    }
  }
}

export const nostraDex = new NostraDex();
const NostraDexAtoms: ProtocolAtoms = {
  pools: atom((get) => {
    const poolsInfo = get(StrkDex2IncentivesAtom);
    const empty: PoolInfo[] = [];
    if (poolsInfo.data) return nostraDex._computePoolsInfo(poolsInfo.data);
    return empty;
  }),
};
export default NostraDexAtoms;
