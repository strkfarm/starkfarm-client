import { AtomWithQueryResult } from 'jotai-tanstack-query';
import { APRSplit, PoolInfo, PoolMetadata } from './pools';
import { TokenName } from '@/constants';
import { StrategyAction } from '@/strategies/IStrategy';
import { CustomAtomWithQueryResult } from '@/utils/customAtomWithQuery';

export interface APRInfo {
  asset: TokenName;
  apr: number;
}

export class IDapp<BaseAPYT> {
  name: string = '';
  link: string = '';
  logo: string = '';

  incentiveDataKey: string = '';
  _computePoolsInfo(data: any): PoolInfo[] {
    throw new Error('not implemented: _computePoolsInfo');
  }

  addBaseAPYs<BaseAPYT>(
    pools: PoolInfo[],
    data: CustomAtomWithQueryResult<BaseAPYT, Error>,
  ): PoolInfo[] {
    console.log(`lending: ${this.name}`, data);
    if (data.isError) {
      console.error('Error fetching lending base', data.error);
    }
    return pools.map((p) => {
      const { baseAPY, splitApr, metadata } = this.getBaseAPY(p, <any>data);
      const aprSplits = p.aprSplits;
      if (splitApr) p.aprSplits.unshift(splitApr);
      return {
        ...p,
        isLoading: data.isLoading,
        aprSplits,
        apr: baseAPY !== 'Err' ? p.apr + baseAPY : p.apr,
        ...metadata,
      };
    });
  }

  getBaseAPY(
    p: PoolInfo,
    data: AtomWithQueryResult<BaseAPYT, Error>,
  ): {
    baseAPY: number | 'Err';
    splitApr: APRSplit | null;
    metadata: PoolMetadata | null;
  } {
    throw new Error('not implemented: getBaseAPY');
  }

  getHF(positions: StrategyAction[]): { hf: number; isLiquidable: boolean } {
    throw new Error('not implemented: getHF');
  }

  getMaxFactoredOut(positions: StrategyAction[], minHf: number): number {
    throw new Error('not implemented: getMaxFactoredOut');
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
    console.log('filter', poolName, supportedPools.includes(poolName));
    // return !poolName.includes('DAI') && !poolName.includes('WSTETH') && !poolName.includes('BTC');
    return supportedPools.includes(poolName);
  }

  getPoolId(protocol: string, poolName: string) {
    return getPoolId(protocol, poolName);
  }
}

export function getPoolId(protocol: string, poolName: string) {
  return `${protocol.toLowerCase().replaceAll(' ', '_')}__${poolName.toLowerCase().replaceAll(' ', '_')}`;
}
