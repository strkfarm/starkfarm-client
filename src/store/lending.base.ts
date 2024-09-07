import CONSTANTS, { TokenName } from '@/constants';
import { APRSplit, Category, PoolInfo, PoolMetadata, PoolType } from './pools';
import { AtomWithQueryResult } from 'jotai-tanstack-query';
import { StrategyAction, StrategyLiveStatus } from '@/strategies/IStrategy';
import { getPoolId } from './IDapp.store';

export namespace LendingSpace {
  export interface MyBaseAprDoc {
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

  export function computePoolsInfo(
    data: any,
    incentiveDataKey: string,
    info: {
      name: string;
      link: string;
      logo: string;
    },
    commonVaultFilter: (poolName: string) => boolean,
  ) {
    const myData = data[incentiveDataKey];
    if (!myData) return [];
    const pools: PoolInfo[] = [];
    Object.keys(myData)
      .filter(commonVaultFilter)
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
            id: getPoolId(info.name, poolName),
            name: poolName,
            logos: [logo1],
          },
          protocol: {
            name: info.name,
            link: info.link,
            logo: info.logo,
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
          additional: {
            tags: [StrategyLiveStatus.ACTIVE],
            isAudited: false, // TODO: Update this
            riskFactor: 0.5,
          },
        };
        pools.push(poolInfo);
      });

    return pools;
  }

  export function getBaseAPY(
    p: PoolInfo,
    data: AtomWithQueryResult<MyBaseAprDoc[], Error>,
  ) {
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

  export function getHF(
    positions: StrategyAction[],
    LIQUIDATION_THRESHOLD: number,
  ) {
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

    return { hf, isLiquidable: hf <= LIQUIDATION_THRESHOLD };
  }
}
