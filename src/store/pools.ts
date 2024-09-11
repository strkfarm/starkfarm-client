import CONSTANTS from '@/constants';
import { Atom, atom } from 'jotai';
import { AtomWithQueryResult, atomWithQuery } from 'jotai-tanstack-query';
import { CustomAtomWithQueryResult } from '@/utils/customAtomWithQuery';
import { customAtomWithFetch } from '@/utils/customAtomWithFetch';
import { StrategyLiveStatus } from '@/strategies/IStrategy';

export enum Category {
  Stable = 'Stable Pools',
  STRK = 'STRK Pools',
  Others = 'Others',
}

export enum PoolType {
  DEXV2 = 'V2 LP DEX',
  DEXV3 = 'Concentrated LP DEX',
  Lending = 'Lending',
  Derivatives = 'Derivatives',
}

export interface APRSplit {
  apr: number | 'Err';
  title: string;
  description: string;
}

export interface PoolMetadata {
  borrow: {
    apr: number;
    borrowFactor: number;
  };
  lending: {
    collateralFactor: number;
  };
}

export interface PoolInfo extends PoolMetadata {
  strategy: typeof import('@/strategies/IStrategy').IStrategy;
  pool: {
    id: string;
    name: string;
    logos: string[];
  };
  protocol: {
    name: string;
    link: string;
    logo: string;
  };
  tvl: number;
  apr: number; // not in %
  aprSplits: APRSplit[];
  category: Category;
  type: PoolType;
  isLoading?: boolean;
  additional: {
    leverage?: number;
    riskFactor: number;
    tags: StrategyLiveStatus[];
    isAudited: boolean;
  };
}

export interface ProtocolAtoms {
  pools: Atom<PoolInfo[]>;
  baseAPRs?: Atom<AtomWithQueryResult<any, Error>>;
}

export interface ProtocolAtoms2 {
  pools: Atom<PoolInfo[]>;
  baseAPRs?: Atom<CustomAtomWithQueryResult<any, Error>>;
}

const _StrkDexIncentivesAtom = customAtomWithFetch({
  queryKey: 'strk_dex_incentives',
  url: CONSTANTS.DEX_INCENTIVE_URL,
});

export const StrkDexIncentivesAtom = atom((get) => {
  const _data = get(_StrkDexIncentivesAtom);
  if (_data.data) {
    let data = JSON.stringify(_data.data);
    data = data.replaceAll('NaN', '0');
    _data.data = JSON.parse(data);
  }
  return _data;
});

export const StrkIncentivesAtom = atomWithQuery((get) => ({
  queryKey: get(StrkIncentivesQueryKeyAtom),
  queryFn: async ({ queryKey }) => {
    const res = await fetch(CONSTANTS.NOSTRA_DEGEN_INCENTIVE_URL);
    let data = await res.text();
    data = data.replaceAll('NaN', '0');
    const parsedData = JSON.parse(data);

    if (queryKey[1] === 'isNostraDex') {
      // Filter the data to include only the specific nostra dex pools we are tracking
      return Object.values(parsedData).filter((item: any) => {
        const id = item.id;
        return id === 'ETH-USDC' || id === 'STRK-ETH' || id === 'STRK-USDC';
      });
    }
    return parsedData;
  },
}));

export const StrkIncentivesQueryKeyAtom = atom([
  'strk_incentives',
  'isNostraDegen',
]);

const _StrkLendingIncentivesAtom = customAtomWithFetch({
  queryKey: 'strk_lending_incentives',
  url: CONSTANTS.LENDING_INCENTIVES_URL,
});

export const StrkLendingIncentivesAtom = atom((get) => {
  const _data = get(_StrkLendingIncentivesAtom);
  if (_data.data) {
    let data = JSON.stringify(_data.data);
    data = data.replaceAll('NaN', '0');
    _data.data = JSON.parse(data);
  }
  return _data;
});
