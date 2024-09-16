import CONSTANTS, { TokenName } from '@/constants';
import {
  Category,
  PoolInfo,
  PoolType,
  ProtocolAtoms,
  StrkLendingIncentivesAtom,
} from './pools';
import { atom } from 'jotai';
import { IDapp } from './IDapp.store';
import { LendingSpace } from './lending.base';
import { AtomWithQueryResult } from 'jotai-tanstack-query';
import { StrategyLiveStatus } from '@/strategies/IStrategy';

export class Hashstack extends IDapp<LendingSpace.MyBaseAprDoc[]> {
  name = 'Hashstack';
  link = 'https://app.hashstack.finance/';
  logo = 'https://app.hashstack.finance/favicon-32x32.png';

  incentiveDataKey = 'Hashstack';
  SUPPLY_FACTOR = 0.7;
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
            id: this.getPoolId(this.name, poolName),
            name: poolName,
            logos: [logo1],
          },
          protocol: {
            name: this.name,
            link: this.link,
            logo: this.logo,
          },
          apr: arr[arr.length - 1].strk_grant_apr_nrs * this.SUPPLY_FACTOR,
          tvl: arr[arr.length - 1].supply_usd,
          aprSplits: [
            {
              apr: 0,
              title: 'Base APR',
              description: 'Shown soon',
            },
            {
              apr: arr[arr.length - 1].strk_grant_apr_nrs * this.SUPPLY_FACTOR,
              title: 'STRK rewards',
              description: 'Starknet DeFi Spring incentives',
            },
          ],
          category,
          type: PoolType.Lending,
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
            riskFactor: 0.5,
          },
        };
        pools.push(poolInfo);
      });

    return pools;
  }

  getBaseAPY(
    p: PoolInfo,
    data: AtomWithQueryResult<LendingSpace.MyBaseAprDoc[], Error>,
  ) {
    return LendingSpace.getBaseAPY(p, data);
  }
}

export const hashstack = new Hashstack();
const HashstackAtoms: ProtocolAtoms = {
  pools: atom((get) => {
    const poolsInfo = get(StrkLendingIncentivesAtom);
    const empty: PoolInfo[] = [];
    if (poolsInfo.data) return hashstack._computePoolsInfo(poolsInfo.data);
    return empty;
  }),
};
export default HashstackAtoms;
