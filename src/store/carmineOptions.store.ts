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

interface CarmineOptionsBaseAprDoc {
}

export class CarmineOptions extends IDapp<CarmineOptionsBaseAprDoc> {
  name = 'Carmine Options';
  link = 'https://app.carmine.finance/staking';
  logo = 'https://app.carmine.finance/logo.png';

  incentiveDataKey = 'Carmine';

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

  getBaseAPY(p: PoolInfo, data: AtomWithQueryResult<CarmineOptionsBaseAprDoc, Error>) {
    let baseAPY: number | 'Err' = 'Err';
    let splitApr: APRSplit | null = null;
    const metadata: PoolMetadata | null = null;

    return {
      baseAPY,
      splitApr,
      metadata,
    };
  }
}


export const carmineOptions = new CarmineOptions();
const CarmineOptionsAtoms: ProtocolAtoms = {
  baseAPRs: atomWithQuery((get) => ({
    queryKey: ['ekubo_base_aprs'],
    queryFn: async ({ queryKey }) => {
    },
  })),
  pools: atom((get) => {
    const poolsInfo = get(StrkDexIncentivesAtom);
    const empty: PoolInfo[] = [];
    if (!CarmineOptionsAtoms.baseAPRs) return empty;
    const baseInfo = get(CarmineOptionsAtoms.baseAPRs);
    if (poolsInfo.data) {
      const pools = carmineOptions._computePoolsInfo(poolsInfo.data);
      return carmineOptions.addBaseAPYs(pools, baseInfo);
    }

    return empty;
  }),
};
export default CarmineOptionsAtoms;
