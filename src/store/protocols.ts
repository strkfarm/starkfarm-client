import EkuboAtoms, { ekubo } from './ekobu.store';
import HaikoAtoms, { haiko } from './haiko.store';
import HashstackAtoms, { hashstack } from './hashstack.store';
import MySwapAtoms, { mySwap } from './myswap.store';
import NostraDexAtoms, { nostraDex } from './nostradex.store';
import NostraDegenAtoms, { nostraDegen } from './nostradegen.store';
import NostraLendingAtoms, { nostraLending } from './nostralending.store';
import SithswapAtoms, { sithswap } from './sithswap.store';
import StarkDefiAtoms, { starkDefi } from './starkdefi.store';
import VesuAtoms, { vesu } from './vesu.store';
import TenkSwapAtoms, { tenkswap } from './tenkswap.store';
import ZkLendAtoms, { zkLend } from './zklend.store';
import CarmineAtoms, { carmine } from './carmine.store';
import { atom } from 'jotai';
import { Category, PoolInfo, PoolType } from './pools';
import strkfarmLogo from '@public/logo.png';
import STRKFarmAtoms, {
  strkfarm,
  STRKFarmStrategyAPIResult,
} from './strkfarm.atoms';
import { getLiveStatusEnum } from './strategies.atoms';

export const PROTOCOLS = [
  {
    name: strkfarm.name,
    class: strkfarm,
    atoms: STRKFarmAtoms,
  },
  {
    name: ekubo.name,
    class: ekubo,
    atoms: EkuboAtoms,
  },
  // {
  //   name: jedi.name,
  //   class: jedi,
  //   atoms: JediAtoms,
  // },
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
  {
    name: vesu.name,
    class: vesu,
    atoms: VesuAtoms,
  },
  // {
  //   name: nimbora.name,
  //   class: nimbora,
  //   atoms: NimboraAtoms,
  // }
];

export const ALL_FILTER = 'All';

const allProtocols = PROTOCOLS.map((p) => ({
  name: p.name,
  logo: p.class.logo,
}));
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
  strat: STRKFarmStrategyAPIResult,
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
      logos: [strat.logo],
    },
    protocol: {
      name: 'STRKFarm',
      link: `/strategy/${strat.id}`,
      logo: strkfarmLogo.src,
    },
    tvl: strat.tvlUsd,
    apr: strat.apy,
    aprSplits: [
      {
        apr: strat.apy,
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
      tags: [getLiveStatusEnum(strat.status.number)],
      isAudited: true,
      leverage: strat.leverage,
    },
  };
}

export const allPoolsAtomWithStrategiesUnSorted = atom((get) => {
  const pools: PoolInfo[] = get(allPoolsAtomUnSorted);
  // const strategies = get(strategiesAtom);
  // const strategyPools: PoolInfo[] = strategies.map((strategy) => {
  //   const tvlInfo = get(strategy.tvlAtom);
  //   return getPoolInfoFromStrategy(strategy, tvlInfo.data?.usdValue || 0);
  // });
  // return strategyPools.concat(pools);
  return pools;
});

// const allPoolsAtom = atom<PoolInfo[]>([]);

const SORT_OPTIONS = ['DEFAULT', 'APR', 'TVL', 'RISK'];

export const sortAtom = atom({
  field: SORT_OPTIONS[0],
  order: 'asc',
});

export const sortPoolsAtom = atom((get) => {
  const pools = get(allPoolsAtomWithStrategiesUnSorted);
  console.log('pre sort', pools);
  const sortSettings = get(sortAtom);
  console.log('sorting', 'initiated');
  pools.sort((a, b) => {
    const sortOption = sortSettings.field;
    const order = sortSettings.order;
    if (sortOption === SORT_OPTIONS[2]) {
      return order == 'desc' ? b.tvl - a.tvl : a.tvl - b.tvl;
    } else if (sortOption === SORT_OPTIONS[3]) {
      return order == 'desc'
        ? b.additional.riskFactor - a.additional.riskFactor
        : a.additional.riskFactor - b.additional.riskFactor;
    } else if (sortOption === SORT_OPTIONS[1]) {
      return order == 'desc' ? b.apr - a.apr : a.apr - b.apr;
    }
    // sort by risk factor, then sort by apr
    // rounding to sync with risk signals shown on UI
    return (
      Math.round(a.additional.riskFactor) -
        Math.round(b.additional.riskFactor) || b.apr - a.apr
    );
  });
  console.log('sorting', 'done');
  return pools;
});

export const filteredPools = atom((get) => {
  console.log(`sorting`, 'filter pools');
  const pools = get(sortPoolsAtom);
  console.log(`sorting`, 'filter pools [2]');
  const categories = get(filterAtoms.categoriesAtom);
  const types = get(filterAtoms.typesAtom);
  const protocols = get(filterAtoms.protocolsAtom);
  const riskLevels = get(filterAtoms.riskAtom);
  console.log(`sorting`, 'filter pools');

  return pools.filter((pool) => {
    // category filter
    if (
      !categories.includes(ALL_FILTER) &&
      !categories.includes(pool.category.valueOf())
    )
      return false;

    // type filter
    if (!types.includes(ALL_FILTER) && !types.includes(pool.type.valueOf()))
      return false;

    // protocol filter
    if (
      !protocols.includes(ALL_FILTER) &&
      !protocols.includes(pool.protocol.name)
    )
      return false;

    // risk filter
    if (
      !riskLevels.includes(ALL_FILTER) &&
      !riskLevels.includes(
        Math.round(pool.additional.riskFactor).toFixed(0).toString(),
      )
    ) {
      return false;
    }
    return true;
  });
});
