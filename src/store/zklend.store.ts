'use client';

import CONSTANTS, { TokenName } from '@/constants';
import {
  APRSplit,
  Category,
  PoolInfo,
  PoolMetadata,
  PoolType,
  ProtocolAtoms,
  StrkLendingIncentivesAtom,
} from './pools';
import { atom } from 'jotai';
import { AtomWithQueryResult, atomWithQuery } from 'jotai-tanstack-query';
import { IDapp } from './IDapp.store';
import { StrategyAction } from '@/strategies/simple.stable.strat';
const fetcher = (...args: any[]) => {
  return fetch(args[0], args[1]).then((res) => res.json());
};

interface MyBaseAprDoc {
  token: {
    decimals: number;
    name: string;
    symbol: TokenName;
  };
  lending_apy: {
    net_apy: number;
    raw_apy: number;
    reward_apy: number;
  };
  price: {
    decimals: number;
    price: string; // "0x554a969a1e",
    quote_currency: string; // USD
  };
  borrowing_apy: {
    net_apy: number; //0.023549914360046387,
    raw_apy: number; // 0.023549914360046387,
    reward_apy: number; // null
  };
  borrow_factor: {
    decimals: number; // 27
    value: string; // "0x33b2e3c9fd0803ce8000000"
  };
  collateral_factor: {
    decimals: number; //27,
    value: string; // "0x295be96e640669720000000"
  };
  // ... has other data, not relevant
}

export class ZkLend extends IDapp<MyBaseAprDoc[]> {
  name = 'zkLend';
  link = 'https://app.zklend.com/markets';
  logo =
    'https://static-assets-8zct.onrender.com/integrations/zkLend/logo_dark.png';

  incentiveDataKey = 'zkLend';
  LIQUIDATION_THRESHOLD = 1;
  _computePoolsInfo(data: any) {
    const myData = data[this.incentiveDataKey];
    if (!myData) return [];
    const pools: PoolInfo[] = [];
    Object.keys(myData)
      .filter(this.commonVaultFilter)
      .forEach((poolName) => {
        const arr = myData[poolName];
        if (arr.length === 0) return;

        let category = Category.Others;
        if (['USDC', 'USDT'].includes(poolName)) {
          category = Category.Stable;
        } else if (poolName.includes('STRK')) {
          category = Category.STRK;
        }

        const logo1 = CONSTANTS.LOGOS[<TokenName>poolName];

        const poolInfo: PoolInfo = {
          pool: {
            name: poolName,
            logos: [logo1],
          },
          protocol: {
            name: this.name,
            link: this.link,
            logo: this.logo,
          },
          apr: arr[arr.length - 1].strk_grant_apr_nrs,
          tvl: arr[arr.length - 1].supply_usd,
          aprSplits: [
            {
              apr: arr[arr.length - 1].strk_grant_apr_nrs,
              title: 'STRK rewards',
              description: 'Starknet DeFi Spring incentives',
            },
          ],
          category,
          type: PoolType.Lending,
          borrow: {
            apr: 0,
            borrowFactor: 0,
          },
          lending: {
            collateralFactor: 0,
          },
        };
        pools.push(poolInfo);
      });

    return pools;
  }

  getBaseAPY(p: PoolInfo, data: AtomWithQueryResult<MyBaseAprDoc[], Error>) {
    let baseAPY: number | 'Err' = 'Err';
    let splitApr: APRSplit | null = null;
    let metadata: PoolMetadata | null = null;
    if (data.isSuccess) {
      const item = data.data.find((doc) => doc.token.symbol === p.pool.name);
      if (item) {
        baseAPY = item.lending_apy.raw_apy;
        splitApr = {
          apr: baseAPY,
          title: 'Base APY',
          description: '',
        };
        metadata = {
          borrow: {
            apr: item.borrowing_apy.net_apy,
            borrowFactor:
              parseInt(item.borrow_factor.value, 10) /
              10 ** item.borrow_factor.decimals,
          },
          lending: {
            collateralFactor:
              parseInt(item.collateral_factor.value, 10) /
              10 ** item.collateral_factor.decimals,
          },
        };
      }
    }
    return {
      baseAPY,
      splitApr,
      metadata,
    };
  }

  // ! To consider price of tokens later. used for stables only for now.
  getHF(positions: StrategyAction[]) {
    // * HF = Sum(Collateral_usd * col_factor) / Sum(debt_usd/debt_factor);
    let numerator = 0;
    let denominator = 0;
    positions.map((p) => {
      // ! TODO To update math using bignumber and decimals
      if (p.isDeposit) {
        numerator +=
          Number(p.amount.toString()) * p.pool.lending.collateralFactor;
      } else {
        denominator += Number(p.amount.toString()) / p.pool.borrow.borrowFactor;
      }
    });

    let hf = Number.MAX_SAFE_INTEGER; // if not debt, i.e. denominator 0;
    if (denominator !== 0) {
      hf = numerator / denominator;
    }

    return { hf, isLiquidable: hf <= this.LIQUIDATION_THRESHOLD };
  }

  // Returns the maximum debt that can be taken out incl. the factor.
  getMaxFactoredOut(positions: StrategyAction[], minHf: number) {
    let numerator = 0;
    let denominator = 0;
    positions.map((p) => {
      // ! TODO To update math using bignumber and decimals
      if (p.isDeposit) {
        numerator +=
          Number(p.amount.toString()) * p.pool.lending.collateralFactor;
      } else {
        denominator += Number(p.amount.toString()) / p.pool.borrow.borrowFactor;
      }
    });

    // HF = (numerator) / (denominator + factoredAmount)
    // whre factoredAmount = (Amount of new Debt / debt factor)
    const factoredAmount = numerator / minHf - denominator;
    if (factoredAmount < 0) return 0;
    return factoredAmount;
  }
}

export const zkLend = new ZkLend();
const ZkLendAtoms: ProtocolAtoms = {
  baseAPRs: atomWithQuery((get) => ({
    queryKey: ['zklend_lending_base_aprs'],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(CONSTANTS.ZKLEND.BASE_APR_API);
      return res.json();
    },
  })),
  pools: atom((get) => {
    const poolsInfo = get(StrkLendingIncentivesAtom);
    const empty: PoolInfo[] = [];
    if (!ZkLendAtoms.baseAPRs) return empty;
    const baseInfo = get(ZkLendAtoms.baseAPRs);
    if (poolsInfo.data) {
      const pools = zkLend._computePoolsInfo(poolsInfo.data);
      return zkLend.addBaseAPYs(pools, baseInfo);
    }
    return empty;
  }),
};
export default ZkLendAtoms;
