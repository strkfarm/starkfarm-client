import EkuboAtoms, { ekubo } from './ekobu.store';
import HaikoAtoms, { haiko } from './haiko.store';
import HashstackAtoms, { hashstack } from './hashstack.store';
import JediAtoms, { jedi } from './jedi.store';
import MySwapAtoms, { mySwap } from './myswap.store';
import NostraDexAtoms, { nostraDex } from './nostradex.store';
import NostraDegenAtoms, { nostraDegen } from './nostradegen.store';
import NostraLendingAtoms, { nostraLending } from './nostralending.store';
import SithswapAtoms, { sithswap } from './sithswap.store';
import StarkDefiAtoms, { starkDefi } from './starkdefi.store';
import TenkSwapAtoms, { tenkswap } from './tenkswap.store';
import ZkLendAtoms, { zkLend } from './zklend.store';
import CarmineAtoms, { carmine } from './carmine.store';
import { atom } from 'jotai';
import { Category, PoolInfo, PoolType } from './pools';
import { strategiesAtom } from './strategies.atoms';
import strkfarmLogo from '@public/logo.png';
import { IStrategyProps } from '@/strategies/IStrategy';

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
    name: mySwap.name,
    class: mySwap,
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
    name: nostraDegen.name,
    class: nostraDegen,
    atoms: NostraDegenAtoms,
  },
  {
    name: carmine.name,
    class: carmine,
    atoms: CarmineAtoms,
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
  // {
  //   name: nimbora.name,
  //   class: nimbora,
  //   atoms: NimboraAtoms,
  // }
];

export const ALL_FILTER = 'All';

const allProtocols = [
  {
    name: 'STRKFarm',
    logo: strkfarmLogo.src,
  },
  ...PROTOCOLS.map((p) => ({
    name: p.name,
    logo: p.class.logo,
  })),
];
export const filters = {
  categories: [...Object.values(Category)],
  types: [...Object.values(PoolType)],
  protocols: allProtocols.filter(
    (p, index) => allProtocols.findIndex((_p) => _p.name == p.name) == index,
  ),
};

export const filterAtoms = {
  categoriesAtom: atom([ALL_FILTER]),
  typesAtom: atom([ALL_FILTER]),
  protocolsAtom: atom([ALL_FILTER]),
  riskAtom: atom([ALL_FILTER]),
};

export const updateFiltersAtom = atom(
  null,
  (
    get,
    set,
    type: 'categories' | 'poolTypes' | 'protocols' | 'risk',
    newOptions: string[],
  ) => {
    console.log(`filter33`, type, newOptions);
    if (type === 'categories') {
      set(filterAtoms.categoriesAtom, newOptions);
    } else if (type === 'poolTypes') {
      set(filterAtoms.typesAtom, newOptions);
    } else if (type === 'protocols') {
      set(filterAtoms.protocolsAtom, newOptions);
    } else if (type === 'risk') {
      set(filterAtoms.riskAtom, newOptions);
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

export function getPoolInfoFromStrategy(
  strat: IStrategyProps,
  tvlInfo: number,
): PoolInfo {
  let category = Category.Others;
  if (strat.name.includes('STRK')) {
    category = Category.STRK;
  } else if (strat.name.includes('USDC')) {
    category = Category.Stable;
  }
  return {
    pool: {
      id: strat.id,
      name: strat.name,
      logos: [strat.holdingTokens[0].logo],
    },
    protocol: {
      name: 'STRKFarm',
      link: `/strategy/${strat.id}`,
      logo: strkfarmLogo.src,
    },
    tvl: tvlInfo,
    apr: strat.netYield,
    aprSplits: [
      {
        apr: strat.netYield,
        title: 'Net Yield',
        description: 'Includes fees & Defi spring rewards',
      },
    ],
    category,
    type: PoolType.Derivatives,
    borrow: {
      apr: 0,
      borrowFactor: 0,
    },
    lending: {
      collateralFactor: 0,
    },
    additional: {
      riskFactor: strat.riskFactor,
      tags: [strat.liveStatus],
      isAudited: true,
      leverage: strat.leverage,
    },
  };
}

export const allPoolsAtomWithStrategiesUnSorted = atom((get) => {
  const pools: PoolInfo[] = get(allPoolsAtomUnSorted);
  const strategies = get(strategiesAtom);
  const strategyPools: PoolInfo[] = strategies.map((strategy) => {
    const tvlInfo = get(strategy.tvlAtom);
    return getPoolInfoFromStrategy(strategy, tvlInfo.data?.usdValue || 0);
  });
  return strategyPools.concat(pools);
});

// const allPoolsAtom = atom<PoolInfo[]>([]);

const SORT_OPTIONS = ['DEFAULT', 'APR', 'TVL', 'RISK'];

export const sortAtom = atom(SORT_OPTIONS[0]);

export const sortPoolsAtom = atom((get) => {
  const pools = get(allPoolsAtomWithStrategiesUnSorted);
  console.log('pre sort', pools);
  const sortOption = get(sortAtom);
  pools.sort((a, b) => {
    if (sortOption === SORT_OPTIONS[2]) {
      return b.tvl - a.tvl;
    } else if (sortOption === SORT_OPTIONS[3]) {
      return b.additional.riskFactor - a.additional.riskFactor;
    } else if (sortOption === SORT_OPTIONS[1]) {
      return b.apr - a.apr;
    }
    // sort by risk factor, then sort by apr
    // rounding to sync with risk signals shown on UI
    return (
      Math.round(a.additional.riskFactor) -
        Math.round(b.additional.riskFactor) || b.apr - a.apr
    );
  });
  return pools;
});

export const filteredPools = atom((get) => {
  const pools = get(sortPoolsAtom);
  const categories = get(filterAtoms.categoriesAtom);
  const types = get(filterAtoms.typesAtom);
  const protocols = get(filterAtoms.protocolsAtom);
  const riskLevels = get(filterAtoms.riskAtom);
  console.log(`risk_levels`, riskLevels);
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
    })
    .filter((pool) => {
      // risk filter
      if (riskLevels.includes(ALL_FILTER)) return true;
      if (
        riskLevels.includes(
          Math.round(pool.additional.riskFactor).toFixed(0).toString(),
        )
      )
        return true;
      return false;
    });
});
