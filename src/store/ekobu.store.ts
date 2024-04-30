'use client';

import CONSTANTS, { TOKENS, TokenName } from '@/constants';
import {
  Category,
  PoolInfo,
  PoolType,
  ProtocolAtoms,
  StrkDexIncentivesAtom,
} from './pools';
import { atom } from 'jotai';
import { atomWithQuery } from 'jotai-tanstack-query';
const fetcher = (...args: any[]) => {
  return fetch(args[0], args[1]).then((res) => res.json());
};

const PairInfo: any = {
  'STRK/USDC':
    '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d/0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
  'STRK/ETH':
    '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d/0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
  'ETH/USDC':
    '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7/0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
  'USDC/USDT':
    '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8/0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8',
};

const Tokens: any = {
  'STRK/USDC':
    '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d/0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
  'ETH/USDC':
    '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7/0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
  'USDC/USDC':
    '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8/0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
  'USDT/USDC':
    '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8/0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
};

export class Ekubo {
  name = 'Ekubo';
  link = 'https://app.ekubo.org/positions';
  logo = 'https://app.ekubo.org/logo.svg';

  incentiveDataKey = 'Ekubo';

  _computePoolsInfo(data: any, fees: any) {
    try {
      const myData = data[this.incentiveDataKey];
      if (!myData) return [];
      const pools: PoolInfo[] = [];

      if (!fees) return [];

      Object.keys(myData)
        .filter(this.commonVaultFilter)
        .forEach((poolName) => {
          const arr = myData[poolName];
          let category = Category.Others;
          if (poolName === 'USDC/USDT') {
            category = Category.Stable;
          } else if (poolName.includes('STRK')) {
            category = Category.STRK;
          }

          const tokens: TokenName[] = <TokenName[]>poolName.split('/');
          const logo1 = CONSTANTS.LOGOS[tokens[0]];
          const logo2 = CONSTANTS.LOGOS[tokens[1]];

          const poolFee = fees[poolName].fees0 + fees[poolName].fees1;

          const poolInfo: PoolInfo = {
            pool: {
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
                apr: (poolFee / arr[arr.length - 1].tvl_usd) * 100,
                title: 'Base APR',
                description: 'Subject to position range',
              },
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
          };
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
}

async function getAprData() {
  const responses = await Promise.all(
    Object.entries(PairInfo).map(async ([pair, addresses]) => {
      const response = await fetch(
        `${CONSTANTS.EKUBO.BASE_APR_API}/${addresses}`,
      );
      const responseData = await response.json();
      return { pair, responseData };
    }),
  );

  const indexedResponses: { [pair: string]: any } = {};
  responses.forEach(({ pair, responseData }) => {
    indexedResponses[pair] = responseData;
  });

  return indexedResponses;
}

async function getPriceData() {
  const responses = await Promise.all(
    Object.entries(Tokens).map(async ([pair, addresses]) => {
      const response = await fetch(
        `${CONSTANTS.EKUBO.BASE_PRICE_API}/${addresses}`,
      );
      const responseData = await response.json();
      return { pair, responseData };
    }),
  );

  const indexedResponses: { [pair: string]: any } = {};
  responses.forEach(({ pair, responseData }) => {
    indexedResponses[pair.split('/')[0]] = responseData;
  });

  return indexedResponses;
}

function getFees(data: any) {
  const fees: { [pair: string]: any } = {};
  const tokensMetadata = Object.fromEntries(
    TOKENS.map((token) => [token.name, token]),
  );

  for (const [pair, aprData] of Object.entries(data.aprData)) {
    const tokens: TokenName[] = <TokenName[]>pair.split('/');
    const token0 = tokens[0];
    const token1 = tokens[1];

    const token0metadata = tokensMetadata[token0];
    const token1metadata = tokensMetadata[token1];

    const price0 = data.prices[token0].price;
    const price1 = data.prices[token1].price;

    const volumeByToken = (aprData as any).volumeByToken;
    const fees0 =
      (parseInt(volumeByToken[0].fees, 10) * price0) /
      10 ** token0metadata.decimals;
    const fees1 =
      (parseInt(volumeByToken[1].fees, 10) * price1) /
      10 ** token1metadata.decimals;

    fees[pair] = { fees0, fees1 };
  }

  return fees;
}

export const ekubo = new Ekubo();
const EkuboAtoms: ProtocolAtoms = {
  baseAPRs: atomWithQuery((get) => ({
    queryKey: ['ekubo_base_aprs'],
    queryFn: async ({ queryKey }) => {
      return { aprData: await getAprData(), prices: await getPriceData() };
    },
  })),
  pools: atom((get) => {
    const poolsInfo = get(StrkDexIncentivesAtom);
    const empty: PoolInfo[] = [];
    if (!EkuboAtoms.baseAPRs) return empty;
    const baseInfo = get(EkuboAtoms.baseAPRs);
    if (poolsInfo.data && baseInfo.data)
      return ekubo._computePoolsInfo(poolsInfo.data, getFees(baseInfo.data));
    return empty;
  }),
};
export default EkuboAtoms;
