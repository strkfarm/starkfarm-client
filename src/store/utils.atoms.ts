import CONSTANTS from '@/constants';
import axios from 'axios';
import { atomWithQuery } from 'jotai-tanstack-query';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { addressAtom } from './claims.atoms';

export interface BlockInfo {
  data: {
    blocks: {
      id: string;
      number: number;
      timestamp: string; // "2024-03-15T08:54:05",
      __typename: 'Block';
    }[];
  };
}

export async function getBlock(
  tSeconds: number,
  retry = 0,
): Promise<BlockInfo> {
  try {
    const data = JSON.stringify({
      query: `query blocks {
            blocks(first: 1, orderBy: "timestamp", orderByDirection: "asc", where: {timestampGt: ${tSeconds}}) {
                id
                number
                timestamp
                __typename
            }
            }`,
      variables: {},
    });
    console.log('jedi base', 'data', data);
    const res = await fetch(CONSTANTS.JEDI.BASE_API, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: data,
    });
    const blockInfo = await res.json();
    console.log('jedi base data', blockInfo, tSeconds);
    return blockInfo;
  } catch (err) {
    console.log('err', err);
    if (retry < 3) {
      await new Promise((res) => setTimeout(res, 2000));
      return await getBlock(tSeconds, retry + 1);
    }
    throw err;
  }
}

export const blockInfoNowAtom = atomWithQuery((get) => ({
  queryKey: ['block_now'],
  queryFn: async (): Promise<BlockInfo> => {
    console.log('jedi base', 'block now');
    const nowSeconds = Math.round(new Date().getTime() / 1000);
    const res = await getBlock(nowSeconds);
    console.log('jedi base', 'data2', res);
    return res;
  },
}));

interface DAppStats {
  tvl: number;
}

export const dAppStatsAtom = atomWithQuery((get) => ({
  queryKey: ['stats'],
  queryFn: async (): Promise<DAppStats> => {
    const res = await axios.get('/api/stats');
    return res.data;
  },
}));

interface StrategyWise {
  id: string;
  usdValue: number;
  amount: string;
  tokenInfo: {
    name: string;
    symbol: string;
    logo: string;
    decimals: number;
    displayDecimals: number;
  };
}

export interface UserStats {
  holdingsUSD: number;
  strategyWise: StrategyWise[];
}

export const userStatsAtom = atomWithQuery((get) => ({
  queryKey: ['user_stats', get(addressAtom)],
  queryFn: async ({ queryKey }: any): Promise<UserStats | null> => {
    console.log('queryKey', queryKey);
    const [_, addr] = queryKey;
    if (!addr) {
      return null;
    }
    const res = await axios.get(`/api/stats/${addr}`);
    return res.data;
  },
}));

interface Price {
  tokenName: string;
  timestamp: string;
  price: string;
}

// export const pricesAtom = atomWithQuery((get) => ({
//     queryKey: ['prices'],
//     queryFn: async ({ queryKey: [] }): Promise<Price[]> => {
//         let tokenInfos = [
//             TOKENS.find(t => t.name == 'zSTRK'),
//             TOKENS.find(t => t.name == 'zUSDC')
//         ]

//         let promises = tokenInfos.map(async (tokenInfo) => {
//             if (tokenInfo) {
//                 const res = await axios.get(`/price/${tokenInfo.ekuboPriceKey}`)
//                 return {
//                     tokenName: tokenInfo.name,
//                     timestamp: res.data.timestamp,
//                     price: res.data.price
//                 }
//             }
//             return {
//                 tokenName: '',
//                 timestamp: '',
//                 price: ''

//             };
//         })
//         return Promise.all(promises);
//     },
// }))

// export const strategyTVLAtom = atom((get) => {
//     const prices = get(pricesAtom);
//     const tvl = prices.reduce((acc, price) => {
//         let tokenInfo = TOKENS.find(t => t.name == price.tokenName)
//         if (tokenInfo) {
//             return acc + (parseFloat(price.price) * tokenInfo.totalSupply)
//         }
//         return acc;
//     }, 0)
//     return tvl;
// })

export const blockInfoMinus1DAtom = atomWithQuery((get) => ({
  queryKey: ['block_minus_1d'],
  queryFn: async ({ queryKey }) => {
    console.log('jedi base', 'block_minus_1d');
    const nowSeconds = Math.round(new Date().getTime() / 1000);
    const NowMinus1DSeconds = nowSeconds - 86400;
    const data = JSON.stringify({
      query: `query blocks {
            blocks(first: 1, orderBy: "timestamp", orderByDirection: "asc", where: {timestampGt: ${NowMinus1DSeconds}}) {
                id
                number
                timestamp
                __typename
            }
            }`,
      variables: {},
    });
    console.log('jedi base', 'data', data);
    const res = await fetch(CONSTANTS.JEDI.BASE_API, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: data,
    });
    console.log('jedi base', 'data2', res.json());
    return res.json();
  },
}));

const ISSERVER = typeof window === 'undefined';
declare let localStorage: any;

export const lastWalletAtom = createAtomWithStorage<null | string>(
  'lastWallet',
  null,
);

export function createAtomWithStorage<T>(
  key: string,
  defaultValue: T,
  getter?: (key: string, initialValue: T) => PromiseLike<T>,
) {
  let storageConfig = createJSONStorage<T>(() => {
    if (!ISSERVER) return localStorage;
    return null;
  });
  if (getter) {
    storageConfig = { ...storageConfig, getItem: getter };
  }
  return atomWithStorage<T>(key, defaultValue, storageConfig, {
    getOnInit: true,
  });
}
