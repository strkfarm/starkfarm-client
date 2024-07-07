import CONSTANTS, { TokenName } from '@/constants';
import { Category, PoolType } from './pools';
import { atom } from 'jotai';
import { PoolInfo, ProtocolAtoms, StrkDegenIncentivesAtom } from './pools';
import { Jediswap } from './jedi.store';

export class NostraDegen extends Jediswap {
  name = 'Nostra DEGEN';
  link = 'https://app.nostra.finance/pools';
  logo = 'https://app.nostra.finance/favicon.svg';
  incentiveDataKey = 'isNostraDegen';

  _computePoolsInfo(data: any) {
    try {
      const myData = data;
      if (!myData) return [];
      const pools: PoolInfo[] = [];
      Object.entries(myData)
        .filter(([_, poolData]: any) => poolData.isDegen)
        .forEach(([poolName, poolData]: any) => {
          const category = Category.Others;
          const tokens: TokenName[] = [poolData.tokenA, poolData.tokenB];
          const logo1 = CONSTANTS.LOGOS[tokens[0]];
          const logo2 = CONSTANTS.LOGOS[tokens[1]];
          const baseApr =
            poolData.baseApr === '0' ? 0.00 : parseFloat(poolData.baseApr);
          const rewardApr = parseFloat(poolData.rewardApr);
          const poolInfo: PoolInfo = {
            pool: {
              name: poolData.id.slice(0, -6),
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

export const nostraDegen = new NostraDegen();
const NostraDegenAtoms: ProtocolAtoms = {
  pools: atom((get) => {
    const poolsInfo = get(StrkDegenIncentivesAtom);
    const empty: PoolInfo[] = [];
    if (poolsInfo.data) return nostraDegen._computePoolsInfo(poolsInfo.data);
    return empty;
  }),
};
export default NostraDegenAtoms;
