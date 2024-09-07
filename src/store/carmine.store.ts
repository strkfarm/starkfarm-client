import CONSTANTS from '@/constants';
import { Category, PoolType } from './pools';
import { atom } from 'jotai';
import { PoolInfo, ProtocolAtoms } from './pools';
import { Jediswap } from './jedi.store';
import { atomWithQuery } from 'jotai-tanstack-query';
import { StrategyLiveStatus } from '@/strategies/IStrategy';

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
        const riskFactor = 3;
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
            id: this.getPoolId(this.name, config.name),
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
          additional: {
            tags: [StrategyLiveStatus.ACTIVE],
            isAudited: false, // TODO: Update this
            riskFactor,
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

const poolEndpoints = [
  { name: 'STRK/USDC Call Pool (STRK)', endpoint: 'strk-usdc-call' },
  { name: 'STRK/USDC Put Pool (USDC)', endpoint: 'strk-usdc-put' },
  { name: 'ETH/STRK Call Pool (ETH)', endpoint: 'eth-strk-call' },
  { name: 'ETH/STRK Put Pool (STRK)', endpoint: 'eth-strk-put' },
  { name: 'ETH/USDC Call Pool (ETH)', endpoint: 'eth-usdc-call' },
  { name: 'ETH/USDC Put Pool (USDC)', endpoint: 'eth-usdc-put' },
  { name: 'wBTC/USDC Put Pool (USDC)', endpoint: 'btc-usdc-put' },
  { name: 'wBTC/USDC Call Pool (wBTC)', endpoint: 'btc-usdc-call' },
];

export const CarmineAtom = atomWithQuery((get) => ({
  queryKey: ['isCarmine'],
  queryFn: async ({ queryKey }) => {
    const fetchPool = async (endpoint: any) => {
      const res = await fetch(`${CONSTANTS.CARMINE_URL}/${endpoint}/apy`);
      let data = await res.text();
      data = data.replaceAll('NaN', '0');
      return JSON.parse(data);
    };

    const fetchRewardApr = async () => {
      const res = await fetch(CONSTANTS.CARMINE_INCENTIVES_URL);
      let data = await res.text();
      data = data.replaceAll('NaN', '0');
      return JSON.parse(data);
    };

    const rewardAprData = await fetchRewardApr();
    const rewardApr = rewardAprData.data.apy;
    const tvl = rewardAprData.data.tvl;

    const poolData = await Promise.all(
      poolEndpoints.map(async (pool) => {
        const data = await fetchPool(pool.endpoint);
        return { name: pool.name, data };
      }),
    );

    const combinedData = poolData.reduce(
      (acc, pool) => {
        acc[pool.name] = {
          ...pool.data,
          rewardApr,
          tvl,
        };
        return acc;
      },
      {} as { [key: string]: any },
    );

    const specificPools = [
      'wBTC/USDC Call Pool (wBTC)',
      'wBTC/USDC Put Pool (USDC)',
    ];
    specificPools.forEach((poolName) => {
      if (combinedData[poolName]) {
        combinedData[poolName].rewardApr = 0.0;
      }
    });

    return combinedData;
  },
}));

const CarmineAtoms: ProtocolAtoms = {
  pools: atom((get) => {
    const poolsInfo = get(CarmineAtom);
    const empty: PoolInfo[] = [];
    if (poolsInfo.data) return carmine._computePoolsInfo(poolsInfo.data);
    return empty;
  }),
};

export default CarmineAtoms;
