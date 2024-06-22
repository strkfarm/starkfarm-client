
'use client';

import CONSTANTS, { TOKENS, TokenName } from '@/constants';
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
import { AtomWithQueryResult, atomWithQuery } from 'jotai-tanstack-query';
import { TokenInfo } from '@/strategies/IStrategy';
import { IDapp } from './IDapp.store';
const fetcher = (...args: any[]) => {
  return fetch(args[0], args[1]).then((res) => res.json());
};

interface EkuboBaseAprDoc {
  [key: string]: Pool[];
}

interface TokenPrice {
  timestamp: string;
  price: string;
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

type IndexedTokenPrices = Record<string, TokenPrice>;
type IndexedPools = Record<string, Pool[]>;

const POOL_NAMES: string[] = ['STRK/USDC', 'STRK/ETH', 'ETH/USDC', 'USDC/USDT'];
const PRICE_PAIRS: string[] = [
  'STRK/USDC',
  'ETH/USDC',
  'USDC/USDC',
  'USDT/USDC',
];

export class Ekubo extends IDapp<EkuboBaseAprDoc> {
  name = 'Ekubo';
  link = 'https://app.ekubo.org/positions';
  logo = 'https://app.ekubo.org/logo.svg';

  incentiveDataKey = 'Ekubo';

  _computePoolsInfo(data: any) {
    try {
      const myData = data[this.incentiveDataKey];
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
    console.log('filter2', poolName, supportedPools.includes(poolName));
    // return !poolName.includes('DAI') && !poolName.includes('WSTETH') && !poolName.includes('BTC');
    return supportedPools.includes(poolName);
  }

  getBaseAPY(p: PoolInfo, data: AtomWithQueryResult<EkuboBaseAprDoc, Error>) {
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
  apiPath: keyof typeof CONSTANTS.EKUBO,
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
        `${CONSTANTS.EKUBO[apiPath]}/${token0.token}/${token1.token}`,
      );
      const data = await response.json();

      return processResponse(item, data, tokensMetadata);
    }),
  );

  return Object.fromEntries(responses);
};

export const ekubo = new Ekubo();
const EkuboAtoms: ProtocolAtoms = {
  baseAPRs: atomWithQuery((get) => ({
    queryKey: ['ekubo_base_aprs'],
    queryFn: async ({ queryKey }) => {
      const tokensMetadata: Record<string, TokenInfo> = Object.fromEntries(
        TOKENS.map((token) => [token.name, token]),
      );

      const indexedTokenPrices: IndexedTokenPrices = await fetchData(
        PRICE_PAIRS,
        'BASE_PRICE_API',
        tokensMetadata,
        (pair, priceData) => [pair.split('/')[0], priceData],
      );

      const indexedPools: IndexedPools = await fetchData(
        POOL_NAMES,
        'BASE_APR_API',
        tokensMetadata,
        (poolName, poolsData: PoolsData) => {
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
    if (!EkuboAtoms.baseAPRs) return empty;
    const baseInfo = get(EkuboAtoms.baseAPRs);
    if (poolsInfo.data) {
      const pools = ekubo._computePoolsInfo(poolsInfo.data);
      return ekubo.addBaseAPYs(pools, baseInfo);
    }

    return empty;
  }),
};
export default EkuboAtoms;