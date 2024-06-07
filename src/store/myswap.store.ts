'use client';

import CONSTANTS, { TOKENS, TokenName } from '@/constants';
import { APRSplit, Category, PoolInfo, PoolMetadata, PoolType, ProtocolAtoms, StrkDexIncentivesAtom } from './pools';
import { atom } from 'jotai';
import { AtomWithQueryResult, atomWithQuery } from 'jotai-tanstack-query';
import { TokenInfo } from '@/strategies/IStrategy';
import { IDapp } from './IDapp.store';
import { tokenPricesAtom } from './tokenPrices.store';

interface MySwapBaseAprDoc {
  [key: string]: Pool[];
}

interface Pool {
  fee: string;
  tick_spacing: number;
  extension: string;
  volume0_24h: string;
  volume1_24h: string;
  fees0_24h: string;
  fees1_24h: string;
  tvl0_total: string;
  tvl1_total: string;
  tvl0_delta_24h: string;
  tvl1_delta_24h: string;
  price0: string;
  price1: string;
  decimals0: number;
  decimals1: number;
}

interface PoolsData {
  topPools: Pool[];
}

type IndexedPools = Record<string, Pool[]>;

const POOL_NAMES: string[] = ['STRK/USDC', 'STRK/ETH', 'ETH/USDC', 'USDC/USDT'];

export class MySwap extends IDapp<MySwapBaseAprDoc> {
  name = 'MySwap (v2)';
  link = 'https://app.myswap.xyz/#/pools';
  logo = 'https://app.myswap.xyz/favicon.ico';
  incentiveDataKey: string = 'MySwap';

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
    console.log('filter2', poolName, supportedPools.includes(poolName));
    return supportedPools.includes(poolName);
  }

  getBaseAPY(p: PoolInfo, data: AtomWithQueryResult<MySwapBaseAprDoc, Error>) {
    let baseAPY: number | 'Err' = 'Err';
    let splitApr: APRSplit | null = null;
    const metadata: PoolMetadata | null = null;
    if (data.isSuccess) {
      const poolName = p.pool.name;
      const pools: Pool[] = data.data[poolName];

      if (pools.length) {
        const baseAPRs: number[] = pools.map((pool) => {
          const fees0 =
            (parseInt(pool.fees0_24h, 10) * parseFloat(pool.price0)) /
            10 ** pool.decimals0;
          const fees1 =
            (parseInt(pool.fees1_24h, 10) * parseFloat(pool.price1)) /
            10 ** pool.decimals1;
          const tvl0 =
            (parseInt(pool.tvl0_total, 10) * parseFloat(pool.price0)) /
            10 ** pool.decimals0;
          const tvl1 =
            (parseInt(pool.tvl1_total, 10) * parseFloat(pool.price1)) /
            10 ** pool.decimals1;

          return 365 * ((fees0 + fees1) / (tvl0 + tvl1));
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

const fetchData = async <T>(
  items: string[],
  apiPath: keyof typeof CONSTANTS.MYSWAP,
  tokensMetadata: Record<string, TokenInfo>,
  processResponse: (
    item: string,
    data: any,
    tokensMetadata: Record<string, TokenInfo>,
  ) => [string, T],
): Promise<Record<string, T>> => {
  const responses = await Promise.all(
    items.map(async (item) => {
      const [token0Name, token1Name] = item.split('/');
      const token0 = tokensMetadata[token0Name];
      const token1 = tokensMetadata[token1Name];

      const response = await fetch(
        `${CONSTANTS.MYSWAP[apiPath]}/${token0.token}/${token1.token}`,
      );
      const data = await response.json();

      return processResponse(item, data, tokensMetadata);
    }),
  );

  return Object.fromEntries(responses);
};

export const myswap = new MySwap();
const MySwapAtoms: ProtocolAtoms = {
  baseAPRs: atomWithQuery((get) => ({
    queryKey: ['myswap_base_aprs'],
    queryFn: async ({ queryKey }) => {
      const tokensMetadata: Record<string, TokenInfo> = Object.fromEntries(
        TOKENS.map((token) => [token.name, token]),
      );

      const indexedPools: IndexedPools = await fetchData(
        POOL_NAMES,
        'BASE_APR_API',
        tokensMetadata,
        (poolName, poolsData: PoolsData) => {
          const tokenPrices = get(tokenPricesAtom);
          const indexedTokenPrices = tokenPrices?.data;

          if (!indexedTokenPrices) {
            throw new Error('Token prices are not available');
          }

          const [token0Name, token1Name] = poolName.split('/');
          const filterResponseData = poolsData.topPools
            .filter(
              (pool) =>
                pool.fees0_24h !== '0' &&
                pool.fees1_24h !== '0' &&
                pool.tvl0_total !== '0' &&
                pool.tvl1_total !== '0',
            )
            .map((pool) => ({
              ...pool,
              price0: indexedTokenPrices[token0Name].price,
              price1: indexedTokenPrices[token1Name].price,
              decimals0: tokensMetadata[token0Name].decimals,
              decimals1: tokensMetadata[token1Name].decimals,
            }));

          return [poolName, filterResponseData];
        },
      );
      return indexedPools;
    },
  })),
  pools: atom((get) => {
    const poolsInfo = get(StrkDexIncentivesAtom);
    const empty: PoolInfo[] = [];
    if (!MySwapAtoms.baseAPRs) return empty;
    const baseInfo = get(MySwapAtoms.baseAPRs);
    if (poolsInfo.data) {
      const pools = myswap._computePoolsInfo(poolsInfo.data);
      return myswap.addBaseAPYs(pools, baseInfo);
    }

    return empty;
  }),
};

export default MySwapAtoms;
