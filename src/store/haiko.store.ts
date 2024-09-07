import CONSTANTS, { TokenName } from '@/constants';
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
import { IDapp } from './IDapp.store';
import { StrategyLiveStatus } from '@/strategies/IStrategy';

type Token = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  rank: number;
};

type Pool = {
  marketId: string;
  baseToken: Token;
  quoteToken: Token;
  width: number;
  strategy: {
    address: string;
    name: string | null;
    symbol: string | null;
    version: string | null;
  };
  swapFeeRate: number;
  feeController: string;
  controller: string;
  currLimit: number;
  currSqrtPrice: string;
  currPrice: string;
  tvl: string;
  feeApy: number;
};
type IndexedPools = Record<string, Pool>;

const POOL_NAMES: string[] = ['STRK/USDC', 'STRK/ETH', 'ETH/USDC', 'USDC/USDT'];

export class Haiko extends IDapp<Pool[]> {
  name = 'Haiko';
  link = 'https://app.haiko.xyz/positions';
  logo = 'https://app.haiko.xyz/favicon.ico';
  incentiveDataKey: string = 'Haiko';

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
          let riskFactor = 3;
          if (poolName === 'USDC/USDT') {
            category = Category.Stable;
            riskFactor = 0.5;
          } else if (poolName.includes('STRK')) {
            category = Category.STRK;
          }

          const tokens: TokenName[] = <TokenName[]>poolName.split('/');
          const logo1 = CONSTANTS.LOGOS[tokens[0]];
          const logo2 = CONSTANTS.LOGOS[tokens[1]];

          const poolInfo: PoolInfo = {
            pool: {
              id: this.getPoolId(this.name, poolName),
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

  getBaseAPY(p: PoolInfo, data: AtomWithQueryResult<Pool[], Error>) {
    let baseAPY: number | 'Err' = 'Err';
    let splitApr: APRSplit | null = null;
    const metadata: PoolMetadata | null = null;
    if (data.isSuccess) {
      const poolName = p.pool.name;
      const pools = filterMarkets(POOL_NAMES, data.data);
      const pool = pools[poolName];
      baseAPY = pool.feeApy;

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

const filterMarkets = (poolNames: string[], pools: Pool[]): IndexedPools => {
  const indexedPools: IndexedPools = {};

  pools.forEach((pool) => {
    const marketTokens = new Set([
      pool.baseToken.symbol,
      pool.quoteToken.symbol,
    ]);

    poolNames.forEach((poolName) => {
      const [tokenA, tokenB] = poolName.split('/');
      if (marketTokens.has(tokenA) && marketTokens.has(tokenB)) {
        const currentBest = indexedPools[poolName];
        if (!currentBest || pool.feeApy > currentBest.feeApy) {
          indexedPools[poolName] = pool;
        }
      }
    });
  });

  return indexedPools;
};

export const haiko = new Haiko();
const HaikoAtoms: ProtocolAtoms = {
  baseAPRs: atomWithQuery((get) => ({
    queryKey: ['haiko_base_aprs'],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`${CONSTANTS.HAIKO.BASE_APR_API}`);
      const data = await response.json();

      return data;
    },
  })),
  pools: atom((get) => {
    const poolsInfo = get(StrkDexIncentivesAtom);
    const empty: PoolInfo[] = [];
    if (!HaikoAtoms.baseAPRs) return empty;
    const baseInfo = get(HaikoAtoms.baseAPRs);
    console.log(baseInfo.data);
    if (poolsInfo.data) {
      const pools = haiko._computePoolsInfo(poolsInfo.data);
      return haiko.addBaseAPYs(pools, baseInfo);
    }

    return empty;
  }),
};
export default HaikoAtoms;
