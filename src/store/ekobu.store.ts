import CONSTANTS, { TokenName } from '@/constants';
import { atom } from 'jotai';
import { AtomWithQueryResult, atomWithQuery } from 'jotai-tanstack-query';
import { IDapp } from './IDapp.store';
import {
  APRSplit,
  Category,
  PoolInfo,
  PoolMetadata,
  PoolType,
  ProtocolAtoms,
  StrkDexIncentivesAtom,
} from './pools';
import { StrategyLiveStatus } from '@/strategies/IStrategy';

const _fetcher = async (...args: any[]) => {
  return fetch(args[0], args[1]).then((res) => res.json());
};

interface EkuboBaseAprDoc {
  tokens: Token[];
  defiSpringData: DefiSpringData;
  pairData: PairData;
  pricesETH: PricesOfToken;
  pricesSTRK: PricesOfToken;
  pricesUSDC: PricesOfToken;
  priceOfStrk: PriceOfToken;
  priceOfEth: PriceOfToken;
}

type Token = {
  name: string;
  symbol: string;
  decimals: number;
  l2_token_address: string;
  sort_order: number;
  total_supply: number;
  hidden?: boolean;
  logo_url: string;
};

type DefiSpringData = {
  strkPrice: number;
  totalStrk: number;
  pairs: [
    {
      token0: Token;
      token1: Token;
      allocations: [
        {
          date: string;
          allocation: number;
          thirty_day_realized_volatility: number;
        },
      ];
      currentApr: number;
      volatilityInTicks: number;
    },
  ];
};

type PairData = {
  topPairs: [
    {
      token0: string;
      token1: string;
      volume0_24h: string;
      volume1_24h: string;
      fees0_24h: string;
      fees1_24h: string;
      tvl0_total: string;
      tvl1_total: string;
      tvl0_delta_24h: string;
      tvl1_delta_24h: string;
    },
  ];
};

type PricesOfToken = {
  timestamp: number;
  prices: [
    {
      token: string;
      price: string;
      k_volume: string;
    },
  ];
};

type PriceOfToken = {
  timestamp: string;
  price: string;
};

export class Ekubo extends IDapp<EkuboBaseAprDoc> {
  name = 'Ekubo';
  link = 'https://app.ekubo.org/positions';
  logo = 'https://app.ekubo.org/logo.svg';

  incentiveDataKey = 'Ekubo';

  _computePoolsInfo(data: any) {
    try {
      const myData = data[0][this.incentiveDataKey];
      const baseInfo = data[1];
      if (!myData) return [];
      const pools: PoolInfo[] = [];

      Object.keys(myData)
        .filter(this.commonVaultFilter)
        .forEach((poolName) => {
          const arr = myData[poolName];
          let category = Category.Others;
          let riskFactor = 3;
          if (poolName === 'USDC/USDT') {
            category = Category.Stable;
            riskFactor = 0.5;
          } else if (poolName.includes('STRK')) {
            category = Category.STRK;
          }

          const tokens: TokenName[] = <TokenName[]>poolName.split('/');
          const logo1 = CONSTANTS.LOGOS[tokens[0]];
          const logo2 = CONSTANTS.LOGOS[tokens[1]];

          const poolInfo: PoolInfo = {
            pool: {
              id: this.getPoolId(this.name, poolName),
              name: poolName,
              logos: [logo1, logo2],
            },
            protocol: {
              name: this.name,
              link: this.link,
              logo: this.logo,
            },
            apr: arr[arr.length - 1].apr,
            tvl: arr[arr.length - 1].tvl_usd,
            aprSplits: [
              {
                apr: arr[arr.length - 1].apr,
                title: 'STRK rewards',
                description: 'Starknet DeFi Spring incentives',
              },
            ],
            category,
            type: PoolType.DEXV3,
            lending: {
              collateralFactor: 0,
            },
            borrow: {
              borrowFactor: 0,
              apr: 0,
            },
            additional: {
              tags: [StrategyLiveStatus.ACTIVE],
              riskFactor,
              isAudited: false, // TODO: Update this
            },
          };

          const { rewardAPY } = this.getBaseAPY(poolInfo, baseInfo);
          if (rewardAPY) {
            poolInfo.apr = rewardAPY;
            poolInfo.aprSplits = [
              {
                apr: rewardAPY,
                title: 'STRK rewards',
                description: 'Starknet DeFi Spring incentives',
              },
            ];
          }
          pools.push(poolInfo);
        });

      return pools;
    } catch (err) {
      console.error('Error fetching pools', err);
      throw err;
    }
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
    console.log('filter2', poolName, supportedPools.includes(poolName));
    // return !poolName.includes('DAI') && !poolName.includes('WSTETH') && !poolName.includes('BTC');
    return supportedPools.includes(poolName);
  }

  getBaseAPY(p: PoolInfo, data: AtomWithQueryResult<EkuboBaseAprDoc, Error>) {
    let rewardAPY: number = 0;
    let baseAPY: number | 'Err' = 'Err';
    let splitApr: APRSplit | null = null;
    const metadata: PoolMetadata | null = null;

    if (data.isSuccess) {
      const poolName = p.pool.name;

      const {
        tokens,
        defiSpringData,
        pairData,
        pricesETH,
        pricesSTRK,
        pricesUSDC,
        priceOfStrk,
        priceOfEth,
      } = data.data;

      const strkToken = tokens.find((t) => t.symbol === 'STRK');

      const pools = pairData.topPairs
        .map((p) => {
          const t0 = BigInt(p.token0);
          const t1 = BigInt(p.token1);
          const token0 = tokens.find((t) => BigInt(t.l2_token_address) === t0);
          if (!token0 || token0.hidden) return;
          const token1 = tokens.find((t) => BigInt(t.l2_token_address) === t1);
          if (!token1 || token1.hidden) return;

          const springPair = defiSpringData.pairs.find(
            (pair) =>
              BigInt(pair.token0.l2_token_address) === t0 &&
              BigInt(pair.token1.l2_token_address) === t1,
          );

          const price0 =
            token0.symbol === 'USDC'
              ? 1
              : getPrice({
                  t: t0,
                  pricesETH,
                  pricesUSDC,
                  pricesSTRK,
                  priceOfEth,
                  priceOfStrk,
                });
          const price1 =
            token1.symbol === 'USDC'
              ? 1
              : getPrice({
                  t: t1,
                  pricesETH,
                  pricesUSDC,
                  pricesSTRK,
                  priceOfEth,
                  priceOfStrk,
                });
          const tvlUsd =
            ((price0 ?? 0) * Number(p.tvl0_total)) /
              Math.pow(10, token0.decimals) +
            ((price1 ?? 0) * Number(p.tvl1_total)) /
              Math.pow(10, token1.decimals);

          if (tvlUsd < 10000) return;
          const feesUsd =
            ((price0 ?? 0) * Number(p.fees0_24h)) /
              Math.pow(10, token0.decimals) +
            ((price1 ?? 0) * Number(p.fees1_24h)) /
              Math.pow(10, token1.decimals);

          const apyBase = (feesUsd * 365) / tvlUsd;
          const apyReward = springPair ? springPair.currentApr : undefined;

          return {
            pool: `${token0.symbol}/${token1.symbol}`,
            symbol: `${token0.symbol}/${token1.symbol}`,
            rewardTokens:
              apyReward && strkToken ? [strkToken.l2_token_address] : [],
            underlyingTokens: [
              token0.l2_token_address,
              token1.l2_token_address,
            ],
            tvlUsd,
            apyBase,
            apyReward,
          };
        })
        .filter((p) => !!p)
        .sort((a, b) => b.tvlUsd - a.tvlUsd);

      const pool = pools.find((p) => p.pool === poolName);

      baseAPY = pool ? pool.apyBase : 0;
      rewardAPY = pool && pool.apyReward ? pool.apyReward : 0;

      splitApr = {
        apr: baseAPY,
        title: 'Base APR',
        description: 'Subject to position range',
      };
    }

    return {
      baseAPY,
      rewardAPY,
      splitApr,
      metadata,
    };
  }
}

const getPrice = ({
  t,
  pricesUSDC,
  pricesETH,
  pricesSTRK,
  priceOfEth,
  priceOfStrk,
}: {
  t: bigint;
  pricesUSDC: PricesOfToken;
  pricesETH: PricesOfToken;
  pricesSTRK: PricesOfToken;
  priceOfEth: PriceOfToken;
  priceOfStrk: PriceOfToken;
}) => {
  let p = pricesUSDC.prices.find(({ token }) => BigInt(token) === t);
  if (p) return Number(p.price);
  p = pricesETH.prices.find(({ token }) => BigInt(token) === t);
  if (p && priceOfEth) {
    return Number(p.price) * Number(priceOfEth.price);
  }
  p = pricesSTRK.prices.find(({ token }) => BigInt(token) === t);
  if (p && priceOfStrk) {
    return Number(p.price) * Number(priceOfStrk);
  }
};

const getData = async (): Promise<EkuboBaseAprDoc> => {
  const [
    tokens,
    defiSpringData,
    pairData,
    pricesETH,
    pricesSTRK,
    pricesUSDC,
    priceOfStrk,
    priceOfEth,
  ] = await Promise.all([
    fetch(`${CONSTANTS.EKUBO.BASE_API}/tokens`).then((response) =>
      response.json(),
    ),
    fetch(`${CONSTANTS.EKUBO.BASE_API}/defi-spring-incentives`).then(
      (response) => response.json(),
    ),
    fetch(`${CONSTANTS.EKUBO.BASE_API}/overview/pairs`).then((response) =>
      response.json(),
    ),
    fetch(`${CONSTANTS.EKUBO.BASE_API}/price/ETH?period=21600`).then(
      (response) => response.json(),
    ),
    fetch(`${CONSTANTS.EKUBO.BASE_API}/price/STRK?period=21600`).then(
      (response) => response.json(),
    ),
    fetch(`${CONSTANTS.EKUBO.BASE_API}/price/USDC?period=21600`).then(
      (response) => response.json(),
    ),
    fetch(`${CONSTANTS.EKUBO.BASE_API}/price/STRK/USDC?period=21600`).then(
      (response) => response.json(),
    ),
    fetch(`${CONSTANTS.EKUBO.BASE_API}/price/ETH/USDC?period=21600`).then(
      (response) => response.json(),
    ),
  ]);

  return {
    tokens,
    defiSpringData,
    pairData,
    pricesETH,
    pricesSTRK,
    pricesUSDC,
    priceOfStrk,
    priceOfEth,
  };
};

export const ekubo = new Ekubo();
const EkuboAtoms: ProtocolAtoms = {
  baseAPRs: atomWithQuery((_get) => ({
    queryKey: ['ekubo_base_aprs'],
    queryFn: async ({ queryKey: _ }) => {
      return await getData();
    },
  })),
  pools: atom((get) => {
    const poolsInfo = get(StrkDexIncentivesAtom);
    const empty: PoolInfo[] = [];
    if (!EkuboAtoms.baseAPRs) return empty;
    const baseInfo = get(EkuboAtoms.baseAPRs);
    if (poolsInfo.data) {
      const pools = ekubo._computePoolsInfo([poolsInfo.data, baseInfo]);
      return ekubo.addBaseAPYs(pools, baseInfo);
    }

    return empty;
  }),
};
export default EkuboAtoms;
