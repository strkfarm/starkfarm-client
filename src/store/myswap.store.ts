'use client';

import {
  APRSplit,
  Category,
  PoolInfo,
  PoolMetadata,
  PoolType,
  ProtocolAtoms,
  StrkDexIncentivesAtom,
} from './pools';
import { atom } from 'jotai';
import { IDapp } from './IDapp.store';
import CONSTANTS, { TokenName } from '@/constants';
import { AtomWithQueryResult, atomWithQuery } from 'jotai-tanstack-query';

interface Token {
  symbol: string;
  address: string;
}

interface Pool {
  poolkey: string;
  token0: Token;
  token1: Token;
  pool_fee: number;
  volume_24h: number;
  tvl: number;
}

interface Pools {
  pools: Pool[];
}

type IndexedPools = Record<string, string[]>;

interface PoolData {
  tvl: number;
  token0: string;
  token1: string;
  fee: number;
  timestamp: number;
  volume_24h: number;
  volume_change_24h: number;
  volume_7d: number;
  volume_change_7d: number;
  tvl_change_24h: number;
  tvl_change_7d: number;
  apr: {
    percentage: number;
    apr_cl: number;
    apr: number;
    incentive_apr: number;
  };
}

interface IndexedPoolData {
  [key: string]: PoolData[];
}

const POOL_NAMES: string[] = ['STRK/USDC', 'STRK/ETH', 'ETH/USDC', 'USDC/USDT'];

export class MySwap extends IDapp<IndexedPoolData> {
  name = 'MySwap (v2)';
  link = 'https://app.myswap.xyz/#/pools';
  logo = 'https://app.myswap.xyz/favicon.ico';
  incentiveDataKey: string = 'MySwap';

  _computePoolsInfo(data: any) {
    try {
      const myData = data[this.incentiveDataKey];
      console.log('myswap', myData);
      if (!myData) return [];
      const pools: PoolInfo[] = [];

      Object.keys(myData)
        .filter(this.commonVaultFilter)
        .forEach((poolName) => {
          const arr = myData[poolName];
          let category = Category.Others;
          if (poolName === 'USDC/USDT') {
            category = Category.Stable;
          } else if (poolName.includes('STRK')) {
            category = Category.STRK;
          }

          const tokens: TokenName[] = <TokenName[]>poolName.split('/');
          const logo1 = CONSTANTS.LOGOS[tokens[0]];
          const logo2 = CONSTANTS.LOGOS[tokens[1]];

          const poolInfo: PoolInfo = {
            pool: {
              name: poolName,
              logos: [logo1, logo2],
            },
            protocol: {
              name: this.name,
              link: this.link,
              logo: this.logo,
            },
            apr: arr[arr.length - 1].apr,
            tvl: arr[arr.length - 1].tvl_usd,
            aprSplits: [
              {
                apr: arr[arr.length - 1].apr,
                title: 'STRK rewards',
                description: 'Starknet DeFi Spring incentives',
              },
            ],
            category,
            type: PoolType.DEXV3,
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
      console.error('Error fetching pools', err);
      throw err;
    }
  }

  commonVaultFilter(poolName: string) {
    const supportedPools = [
      'ETH/USDC',
      'STRK/USDC',
      'STRK/ETH',
      'USDC/USDT',
      'USDC',
      'USDT',
      'ETH',
      'STRK',
    ];
    return supportedPools.includes(poolName);
  }

  getBaseAPY(p: PoolInfo, data: AtomWithQueryResult<IndexedPoolData, Error>) {
    let baseAPY: number | 'Err' = 'Err';
    let splitApr: APRSplit | null = null;
    const metadata: PoolMetadata | null = null;
    if (data.isSuccess) {
      const poolName = p.pool.name;
      const pools = data.data[poolName];

      if (pools.length) {
        const baseAPRs: number[] = pools.map((pool) => {
          return pool.apr.apr_cl / 100;
        });

        baseAPY = Math.max(...baseAPRs);
      } else {
        baseAPY = 0;
      }

      splitApr = {
        apr: baseAPY,
        title: 'Base APR',
        description: 'Subject to position range',
      };
    }

    return {
      baseAPY,
      splitApr,
      metadata,
    };
  }
}

const fetch_pools = async () => {
  const response = await fetch(`${CONSTANTS.MY_SWAP.POOLS_API}`);
  const data = await response.json();
  return data;
};

const getPoolKeys = (pools: Pools, poolNames: string[]): IndexedPools => {
  const indexedPools: IndexedPools = {};

  pools.pools.forEach((pool) => {
    const poolName = `${pool.token0.symbol}/${pool.token1.symbol}`;
    if (poolNames.includes(poolName)) {
      if (!indexedPools[poolName]) {
        indexedPools[poolName] = [];
      }
      indexedPools[poolName].push(pool.poolkey);
    }
  });

  return indexedPools;
};

const fetchAprData = async (
  pool_names: string[],
  indexed_pool_keys: IndexedPools,
) => {
  const responses = await Promise.all(
    pool_names.map(async (pool_name) => {
      const pool_keys = indexed_pool_keys[pool_name];
      if (pool_keys.length) {
        const pools = await Promise.all(
          pool_keys.map(async (pool_key) => {
            const response = await fetch(
              `${CONSTANTS.MY_SWAP.BASE_APR_API}/${pool_key}/overview.json`,
            );

            const data = await response.json();
            return data;
          }),
        );

        return [pool_name, pools];
      }

      return [pool_name, []];
    }),
  );

  return Object.fromEntries(responses);
};

export const mySwap = new MySwap();
const MySwapAtoms: ProtocolAtoms = {
  baseAPRs: atomWithQuery((get) => ({
    queryKey: ['mySwap_base_aprs'],
    queryFn: async ({ queryKey }) => {
      const pools = await fetch_pools();
      const pool_keys = getPoolKeys(pools, POOL_NAMES);
      const apr_data = fetchAprData(POOL_NAMES, pool_keys);

      return apr_data;
    },
  })),
  pools: atom((get) => {
    const poolsInfo = get(StrkDexIncentivesAtom);
    const empty: PoolInfo[] = [];
    if (!MySwapAtoms.baseAPRs) return empty;
    const baseInfo = get(MySwapAtoms.baseAPRs);
    if (poolsInfo.data) {
      const pools = mySwap._computePoolsInfo(poolsInfo.data);
      return mySwap.addBaseAPYs(pools, baseInfo);
      return pools;
    }
    return empty;
  }),
};
export default MySwapAtoms;
