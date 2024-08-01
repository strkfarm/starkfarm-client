import CONSTANTS from '@/constants';
import { Category, PoolType } from './pools';
import { atom } from 'jotai';
import { PoolInfo, ProtocolAtoms, CarmineAtom } from './pools';
import { Jediswap } from './jedi.store';

const poolConfigs = [
  { name: 'STRK/USDC Call Pool (STRK)', tokenA: 'STRK', tokenB: 'USDC' },
  { name: 'STRK/USDC Put Pool (USDC)', tokenA: 'STRK', tokenB: 'USDC' },
  { name: 'ETH/STRK Call Pool (ETH)', tokenA: 'ETH', tokenB: 'STRK' },
  { name: 'ETH/STRK Put Pool (STRK)', tokenA: 'ETH', tokenB: 'STRK' },
  { name: 'ETH/USDC Call Pool (ETH)', tokenA: 'ETH', tokenB: 'USDC' },
  { name: 'ETH/USDC Put Pool (USDC)', tokenA: 'ETH', tokenB: 'USDC' },
  { name: 'wBTC/USDC Put Pool (USDC)', tokenA: 'WBTC', tokenB: 'USDC' },
  { name: 'wBTC/USDC Call Pool (wBTC)', tokenA: 'WBTC', tokenB: 'USDC' },
];

export class Carmine extends Jediswap {
  name = 'Carmine Options';
  link = 'https://app.carmine.finance/staking';
  logo =
    'https://static-assets-8zct.onrender.com/integrations/carmine/carmine.jpg';
  incentiveDataKey = 'isCarmine';

  _computePoolsInfo(data: any) {
    try {
      const myData = data;
      if (!myData) return [];
      const pools: PoolInfo[] = [];

      poolConfigs.forEach((config) => {
        const poolData = myData[config.name];
        if (!poolData || !poolData.data) return;

        let category: Category;
        if (config.name.endsWith('(USDC)')) {
          category = Category.Stable;
        } else if (config.name.endsWith('(STRK)')) {
          category = Category.STRK;
        } else {
          category = Category.Others;
        }

        const logo1 =
          CONSTANTS.LOGOS[config.tokenA as keyof typeof CONSTANTS.LOGOS];
        const logo2 =
          CONSTANTS.LOGOS[config.tokenB as keyof typeof CONSTANTS.LOGOS];

        const baseApr =
          poolData.data.week_annualized / 100 === 0
            ? 0.0
            : parseFloat(poolData.data.week_annualized) / 100;
        const rewardApr = parseFloat(poolData.rewardApr) || 0;

        const poolInfo: PoolInfo = {
          pool: {
            name: config.name,
            logos: [logo1, logo2],
          },
          protocol: {
            name: this.name,
            link: this.link,
            logo: this.logo,
          },
          apr: baseApr + rewardApr,
          tvl: poolData.tvl,
          aprSplits: [
            {
              apr: baseApr || baseApr.toString() === '' ? baseApr : 0,
              title: 'Supply Apy',
              description: '',
            },
            {
              apr: rewardApr ?? 0,
              title: 'STRK DeFi Spring rewards',
              description: '',
            },
          ],
          category,
          type: PoolType.Derivatives,
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

export const carmine = new Carmine();

const CarmineAtoms: ProtocolAtoms = {
  pools: atom((get) => {
    const poolsInfo = get(CarmineAtom);
    const empty: PoolInfo[] = [];
    if (poolsInfo.data) return carmine._computePoolsInfo(poolsInfo.data);
    return empty;
  }),
};

export default CarmineAtoms;
