import CONSTANTS from '@/constants';
import { Atom, atom } from 'jotai';
import { AtomWithQueryResult, atomWithQuery } from 'jotai-tanstack-query';
import EkuboAtoms, { ekubo } from './ekobu.store';
import HaikoAtoms, { haiko } from './haiko.store';
import HashstackAtoms, { hashstack } from './hashstack.store';
import JediAtoms, { jedi } from './jedi.store';
import MySwapAtoms, { MySwap } from './myswap.store';
import NimboraAtoms, { nimbora } from './nimbora.store';
import NostraDexAtoms, { nostraDex } from './nostradex.store';
import NostraLendingAtoms, { nostraLending } from './nostralending.store';
import SithswapAtoms, { sithswap } from './sithswap.store';
import StarkDefiAtoms, { starkDefi } from './starkdefi.store';
import TenkSwapAtoms, { tenkswap } from './tenkswap.store';
import ZkLendAtoms, { zkLend } from './zklend.store';

export enum Category {
  Stable = 'Stable Pools',
  STRK = 'STRK Pools',
  Others = 'Others',
}

export enum PoolType {
  DEXV2 = 'V2 LP DEX',
  DEXV3 = 'Concentrated LP DEX',
  Lending = 'Lending',
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
  pool: {
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
}

export interface ProtocolAtoms {
  pools: Atom<PoolInfo[]>;
  baseAPRs?: Atom<AtomWithQueryResult<any, Error>>;
}

export const PROTOCOLS = [
  {
    name: ekubo.name,
    class: ekubo,
    atoms: EkuboAtoms,
  },
  {
    name: jedi.name,
    class: jedi,
    atoms: JediAtoms,
  },
  {
    name: MySwap.name,
    class: MySwap,
    atoms: MySwapAtoms,
  },
  {
    name: tenkswap.name,
    class: tenkswap,
    atoms: TenkSwapAtoms,
  },
  {
    name: haiko.name,
    class: haiko,
    atoms: HaikoAtoms,
  },
  {
    name: nostraDex.name,
    class: nostraDex,
    atoms: NostraDexAtoms,
  },
  {
    name: starkDefi.name,
    class: starkDefi,
    atoms: StarkDefiAtoms,
  },
  {
    name: sithswap.name,
    class: sithswap,
    atoms: SithswapAtoms,
  },
  {
    name: zkLend.name,
    class: zkLend,
    atoms: ZkLendAtoms,
  },
  {
    name: nostraLending.name,
    class: nostraLending,
    atoms: NostraLendingAtoms,
  },
  {
    name: hashstack.name,
    class: hashstack,
    atoms: HashstackAtoms,
  },
  {
    name: nimbora.name,
    class: nimbora,
    atoms: NimboraAtoms,
  },
];

export const StrkDexIncentivesAtom = atomWithQuery((get) => ({
  queryKey: ['strk_dex_incentives'],
  queryFn: async ({ queryKey }) => {
    const res = await fetch(CONSTANTS.DEX_INCENTIVE_URL); // common for all
    let data = await res.text();
    data = data.replaceAll('NaN', '0');
    return JSON.parse(data);
  },
}));

export const StrkLendingIncentivesAtom = atomWithQuery((get) => ({
  queryKey: ['strk_lending_incentives'],
  queryFn: async ({ queryKey }) => {
    const res = await fetch(CONSTANTS.LENDING_INCENTIVES_URL); // common for all
    let data = await res.text();
    data = data.replaceAll('NaN', '0');
    return JSON.parse(data);
  },
}));

export const ALL_FILTER = 'All';
export const filters = {
  categories: [...Object.values(Category)],
  types: [...Object.values(PoolType)],
  protocols: [...PROTOCOLS.map((p) => p.name)],
};

export const filterAtoms = {
  categoriesAtom: atom([ALL_FILTER]),
  typesAtom: atom([ALL_FILTER]),
  protocolsAtom: atom([ALL_FILTER]),
};

export const updateFiltersAtom = atom(
  null,
  (
    get,
    set,
    type: 'categories' | 'poolTypes' | 'protocols',
    newOptions: string[],
  ) => {
    if (type === 'categories') {
      set(filterAtoms.categoriesAtom, newOptions);
    } else if (type === 'poolTypes') {
      set(filterAtoms.typesAtom, newOptions);
    } else if (type === 'protocols') {
      set(filterAtoms.protocolsAtom, newOptions);
    }
  },
);

export const allPoolsAtomUnSorted = atom((get) => {
  const pools: PoolInfo[] = [];
  return PROTOCOLS.reduce(
    (_pools, p) => _pools.concat(get(p.atoms.pools)),
    pools,
  );
});

// const allPoolsAtom = atom<PoolInfo[]>([]);

const SORT_OPTIONS = ['APR', 'TVL'];

export const sortAtom = atom(SORT_OPTIONS[0]);

export const sortPoolsAtom = atom((get) => {
  const pools = get(allPoolsAtomUnSorted);
  console.log('pre sort', pools);
  const sortOption = get(sortAtom);
  pools.sort((a, b) => {
    if (sortOption === SORT_OPTIONS[1]) {
      return b.tvl - a.tvl;
    }
    return b.apr - a.apr;
  });
  return pools;
});

export const filteredPools = atom((get) => {
  const pools = get(sortPoolsAtom);
  const categories = get(filterAtoms.categoriesAtom);
  const types = get(filterAtoms.typesAtom);
  const protocols = get(filterAtoms.protocolsAtom);
  return pools
    .filter((pool) => {
      // category filter
      if (categories.includes(ALL_FILTER)) return true;
      if (categories.includes(pool.category.valueOf())) return true;
      return false;
    })
    .filter((pool) => {
      // type filter
      if (types.includes(ALL_FILTER)) return true;
      if (types.includes(pool.type.valueOf())) return true;
      return false;
    })
    .filter((pool) => {
      // protocol filter
      if (protocols.includes(ALL_FILTER)) return true;
      if (protocols.includes(pool.protocol.name)) return true;
      return false;
    });
});
