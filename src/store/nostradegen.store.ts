import CONSTANTS, { TokenName } from '@/constants';
import { Category, PoolType } from './pools';
import { atom } from 'jotai';
import { PoolInfo, ProtocolAtoms, StrkIncentivesAtom } from './pools';
import { Jediswap } from './jedi.store';
import { StrategyLiveStatus } from '@/strategies/IStrategy';

export class NostraDegen extends Jediswap {
  name = 'Nostra';
  link = 'https://app.nostra.finance/pools';
  logo =
    'https://static-assets-8zct.onrender.com/integrations/nostra/logo_dark.jpg';
  incentiveDataKey = 'isNostraDegen';

  _computePoolsInfo(data: any) {
    try {
      const myData = data;
      if (!myData) return [];
      const pools: PoolInfo[] = [];
      Object.entries(myData)
        .filter(([_, poolData]: any) => poolData.isDegen)
        .forEach(([poolName, poolData]: any) => {
          const tokens: TokenName[] = [poolData.tokenA, poolData.tokenB];
          const logo1 = CONSTANTS.LOGOS[tokens[0]];
          const logo2 = CONSTANTS.LOGOS[tokens[1]];
          const baseApr =
            poolData.baseApr === '0' ? 0.0 : parseFloat(poolData.baseApr);
          const rewardApr = parseFloat(poolData.rewardApr);
          const isStrkPool = poolData.id.includes('STRK');
          const category = isStrkPool ? Category.STRK : Category.Others;

          const _poolName = poolData.id;
          const poolInfo: PoolInfo = {
            pool: {
              id: this.getPoolId(this.name, _poolName),
              name: _poolName,
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
            additional: {
              tags: [StrategyLiveStatus.ACTIVE],
              isAudited: false, // TODO: Update this
              riskFactor: 3,
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
    const poolsInfo = get(StrkIncentivesAtom);
    const empty: PoolInfo[] = [];
    if (poolsInfo.data) return nostraDegen._computePoolsInfo(poolsInfo.data);
    return empty;
  }),
};
export default NostraDegenAtoms;
