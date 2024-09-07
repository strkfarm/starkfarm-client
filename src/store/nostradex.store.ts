import CONSTANTS, { TokenName } from '@/constants';
import { Category, PoolType } from './pools';
import { atom } from 'jotai';
import { PoolInfo, ProtocolAtoms, StrkIncentivesAtom } from './pools';
import { Jediswap } from './jedi.store';
import { StrategyLiveStatus } from '@/strategies/IStrategy';

export class NostraDex extends Jediswap {
  name = 'Nostra';
  link = 'https://app.nostra.finance/pools';
  logo =
    'https://static-assets-8zct.onrender.com/integrations/nostra/logo_dark.jpg';
  incentiveDataKey = 'isNostraDex';

  _computePoolsInfo(data: any) {
    try {
      const myData = data;
      if (!myData) return [];
      const pools: PoolInfo[] = [];

      const supportedPools = ['ETH-USDC', 'STRK-ETH', 'STRK-USDC', 'USDC-USDT'];
      // Filter and map only the required pools
      Object.values(myData)
        .filter((poolData: any) => {
          const id = poolData.id;
          return supportedPools.includes(id);
        })
        .forEach((poolData: any) => {
          const tokens: TokenName[] = [poolData.tokenA, poolData.tokenB];
          const logo1 = CONSTANTS.LOGOS[tokens[0]];
          const logo2 = CONSTANTS.LOGOS[tokens[1]];
          const baseApr =
            poolData.baseApr === '0' ? 0.0 : parseFloat(poolData.baseApr);
          const rewardApr = parseFloat(poolData.rewardApr);

          let category = Category.Others;
          let riskFactor = 3;
          if (poolData.id === 'USDC-USDT') {
            category = Category.Stable;
            riskFactor = 0.5;
          } else if (poolData.id.includes('STRK')) {
            category = Category.STRK;
          }
          const poolInfo: PoolInfo = {
            pool: {
              id: this.getPoolId(this.name, poolData.id.slice(0, -6)),
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
            additional: {
              riskFactor,
              tags: [StrategyLiveStatus.ACTIVE],
              isAudited: false, // TODO: Update this
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
    const poolsInfo = get(StrkIncentivesAtom);
    const empty: PoolInfo[] = [];
    if (poolsInfo.data) return nostraDex._computePoolsInfo(poolsInfo.data);
    return empty;
  }),
};
export default NostraDexAtoms;
