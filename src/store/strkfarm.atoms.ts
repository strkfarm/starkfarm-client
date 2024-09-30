import CONSTANTS from '@/constants';
import {
  APRSplit,
  Category,
  PoolInfo,
  PoolMetadata,
  PoolType,
  ProtocolAtoms,
} from './pools';
import { atom } from 'jotai';
import { IDapp } from './IDapp.store';
import { AtomWithQueryResult, atomWithQuery } from 'jotai-tanstack-query';
import strkfarmLogo from '@public/logo.png';
import { getLiveStatusEnum } from './strategies.atoms';

export interface STRKFarmStrategyAPIResult {
  name: string;
  id: string;
  apy: number;
  depositToken: string[];
  leverage: number;
  contract: { name: string; address: string }[];
  tvlUsd: number;
  status: {
    number: number;
    value: string;
  };
  riskFactor: number;
  logo: string;
}

export class STRKFarm extends IDapp<STRKFarmStrategyAPIResult> {
  name = 'STRKFarm';
  link = strkfarmLogo.src;
  logo = 'https://app.jediswap.xyz/favicon/favicon-32x32.png';
  incentiveDataKey = 'Jediswap_v1';

  _computePoolsInfo(data: any) {
    const rawPools: STRKFarmStrategyAPIResult[] = data.strategies;
    const pools: PoolInfo[] = [];
    return rawPools.map((rawPool) => {
      let category = Category.Others;
      const poolName = rawPool.name;
      const riskFactor = rawPool.riskFactor;
      if (poolName.includes('USDC') || poolName.includes('USDT')) {
        category = Category.Stable;
      } else if (poolName.includes('STRK')) {
        category = Category.STRK;
      }
      const poolInfo: PoolInfo = {
        pool: {
          id: rawPool.id,
          name: poolName,
          logos: [rawPool.logo],
        },
        protocol: {
          name: this.name,
          link: this.link,
          logo: this.logo,
        },
        apr: rawPool.apy,
        tvl: rawPool.tvlUsd,
        aprSplits: [],
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
          riskFactor,
          tags: [getLiveStatusEnum(rawPool.status.number)],
          isAudited: true,
        },
      };
      return poolInfo;
    });
  }

  getBaseAPY(p: PoolInfo, data: AtomWithQueryResult<any, Error>) {
    const aprData: STRKFarmStrategyAPIResult[] = data.data.strategies;
    let baseAPY: number | 'Err' = 'Err';
    let splitApr: APRSplit | null = null;
    const metadata: PoolMetadata | null = null;
    if (data.isSuccess) {
      const item = aprData.find((doc) => doc.id === p.pool.id);
      if (item) {
        baseAPY = item.apy;
        splitApr = {
          apr: baseAPY,
          title: 'Net APY',
          description: 'Includes fees & Defi spring rewards',
        };
      }
    }
    return {
      baseAPY,
      splitApr,
      metadata,
    };
  }
}

export const strkfarm = new STRKFarm();
const STRKFarmAtoms: ProtocolAtoms = {
  baseAPRs: atomWithQuery((get) => ({
    queryKey: ['strkfarm_base_aprs'],
    queryFn: async ({
      queryKey,
    }): Promise<{
      strategies: STRKFarmStrategyAPIResult[];
    }> => {
      const response = await fetch(`${CONSTANTS.STRKFarm.BASE_APR_API}`);
      const data = await response.json();
      return data;
    },
  })),
  pools: atom((get) => {
    const empty: PoolInfo[] = [];
    if (!STRKFarmAtoms.baseAPRs) return empty;
    const baseInfo = get(STRKFarmAtoms.baseAPRs);
    if (baseInfo.data) {
      const pools = strkfarm._computePoolsInfo(baseInfo.data);
      return strkfarm.addBaseAPYs(pools, baseInfo);
    }
    return empty;
  }),
};
export default STRKFarmAtoms;
