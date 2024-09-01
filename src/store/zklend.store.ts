import CONSTANTS from '@/constants';
import { PoolInfo, ProtocolAtoms2, StrkLendingIncentivesAtom } from './pools';
import { atom } from 'jotai';
import { AtomWithQueryResult } from 'jotai-tanstack-query';
import { IDapp } from './IDapp.store';
import { StrategyAction } from '@/strategies/IStrategy';
import { LendingSpace } from './lending.base';
import { customAtomWithFetch } from '@/utils/customAtomWithFetch';
const fetcher = (...args: any[]) => {
  return fetch(args[0], args[1]).then((res) => res.json());
};

export class ZkLend extends IDapp<LendingSpace.MyBaseAprDoc[]> {
  name = 'zkLend';
  link = 'https://app.zklend.com/markets';
  logo =
    'https://static-assets-8zct.onrender.com/integrations/zkLend/logo_dark.png';

  incentiveDataKey = 'zkLend';
  LIQUIDATION_THRESHOLD = 1;
  _computePoolsInfo(data: any) {
    return LendingSpace.computePoolsInfo(
      data,
      this.incentiveDataKey,
      {
        name: this.name,
        link: this.link,
        logo: this.logo,
      },
      this.commonVaultFilter,
    );
  }

  getBaseAPY(
    p: PoolInfo,
    data: AtomWithQueryResult<LendingSpace.MyBaseAprDoc[], Error>,
  ) {
    return LendingSpace.getBaseAPY(p, data);
  }

  // ! To consider price of tokens later. used for stables only for now.
  getHF(positions: StrategyAction[]) {
    return LendingSpace.getHF(positions, this.LIQUIDATION_THRESHOLD);
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
const ZkLendAtoms: ProtocolAtoms2 = {
  baseAPRs: customAtomWithFetch({
    url: CONSTANTS.ZKLEND.BASE_APR_API,
    queryKey: 'zklend_lending_base_aprs',
  }),
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
