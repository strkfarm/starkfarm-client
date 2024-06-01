# Add New Protocol

This documentation provides a guide on how to create a store for a protocol, which implements the IDapp class from `IDapp.store.ts`. The store fetches, processes, and manages APR and pool data for a specific decentralized application (dApp).

## Prerequisites

Before starting, ensure you have the following:

- A basic understanding of TypeScript and object-oriented programming.
- Familiarity with React and state management using Jotai.
- Knowledge of how to fetch and handle data from APIs.

## Steps to Create a Store

1. Define the Protocol Class

Create a new file for your protocol, e.g., `myprotocol.store.ts` in `src/store`. Import necessary modules and extend the IDapp class.

```TypeScript
'use client';

import CONSTANTS, { TOKENS, TokenName } from '@/constants';
import {
  APRSplit,
  Category,
  PoolInfo,
  PoolMetadata,
  PoolType,
  ProtocolAtoms,
} from './pools';
import { atom } from 'jotai';
import { AtomWithQueryResult, atomWithQuery } from 'jotai-tanstack-query';
import { TokenInfo } from '@/strategies/IStrategy';
import { IDapp } from './IDapp.store';
const fetcher = (...args: any[]) => {
  return fetch(args[0], args[1]).then((res) => res.json());
};

const POOL_NAMES: string[] = ['STRK/USDC', 'STRK/ETH', 'ETH/USDC', 'USDC/USDT'];

export class MyProtocol extends IDapp<BaseAPYT> {}
```

2. Implement Function to Compute Pools Info

Add a method to compute pool information within your protocol class.

```TypeScript
export class MyProtocol extends IDapp<BaseAPYT> {
    _computePoolsInfo(data: any) {
        try {
            const myData = data[this.incentiveDataKey];
            if (!myData) return [];
            const pools: PoolInfo[] = [];

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

                const tokens: TokenName[] = poolName.split('/');
                const logo1 = CONSTANTS.LOGOS[tokens[0]];
                const logo2 = CONSTANTS.LOGOS[tokens[1]];

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
    return supportedPools.includes(poolName);
  }
}
```

3. Implement Function to Calculate Base APRs

Add a method to calculate the base APRs.

```TypeScript
export class MyProtocol extends IDapp<BaseAPYT> {
    // previous code ...

    getBaseAPY(p: PoolInfo, data: AtomWithQueryResult<BaseAPYT, Error>) {
        // logic to calculate the base APRs for the pools in the protocol you're adding goes here.

        // base APR is calculated by:
        const baseAPR =  365 * ((fees0 + fees1) / (tvl0 + tvl1));

        /**
         * where:
         * fees0 = fees for base token
         * fees1 = fees for quote token
         * tvl0 = total volume locked for base token
         * tvl1 = total volume locked for quote token
        */


        // see getBaseAPY() IDapp.store.ts for how the data is returned.
    }
}
```

4. Instantiate Protocol class

```TypeScript
export const myProtocol = new MyProtocol();
```

5. Set Up Jotai Atoms

Set up Jotai atoms to manage the state and data fetching for the protocol.

```TypeScript
const MyProtocolAtoms: ProtocolAtoms = {
  baseAPRs: atomWithQuery((get) => ({
    queryKey: ['myprotocol_base_aprs'],
    queryFn: async ({ queryKey }) => {
      // logic to fetch pools data from the protocol's APIs goes here
      // These data is used to calculate the base APRs for the pools
  })),
  pools: atom((get) => {
    const poolsInfo = get(StrkDexIncentivesAtom);
    const empty: PoolInfo[] = [];
    if (!MyProtocolAtoms.baseAPRs) return empty;
    const baseInfo = get(MyProtocolAtoms.baseAPRs);
    if (poolsInfo.data) {
      const pools = myProtocol._computePoolsInfo(poolsInfo.data);
      return myProtocol.addBaseAPYs(pools, baseInfo);
    }
    return empty;
  }),
};
```

5. Export Protocol Atoms

```TypeScript
export default MyProtocolAtoms;
```

## Complete code

```TypeScript
'use client';

import CONSTANTS, { TOKENS, TokenName } from '@/constants';
import {
  APRSplit,
  Category,
  PoolInfo,
  PoolMetadata,
  PoolType,
  ProtocolAtoms,
} from './pools';
import { atom } from 'jotai';
import { AtomWithQueryResult, atomWithQuery } from 'jotai-tanstack-query';
import { TokenInfo } from '@/strategies/IStrategy';
import { IDapp } from './IDapp.store';
const fetcher = (...args: any[]) => {
  return fetch(args[0], args[1]).then((res) => res.json());
};

const POOL_NAMES: string[] = ['STRK/USDC', 'STRK/ETH', 'ETH/USDC', 'USDC/USDT'];

export class MyProtocol extends IDapp<BaseAPYT> {
    _computePoolsInfo(data: any) {
        try {
            const myData = data[this.incentiveDataKey];
            if (!myData) return [];
            const pools: PoolInfo[] = [];

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

                const tokens: TokenName[] = poolName.split('/');
                const logo1 = CONSTANTS.LOGOS[tokens[0]];
                const logo2 = CONSTANTS.LOGOS[tokens[1]];

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
    return supportedPools.includes(poolName);
  }

  getBaseAPY(p: PoolInfo, data: AtomWithQueryResult<BaseAPYT, Error>) {
    }
}

export const myProtocol = new MyProtocol();

const MyProtocolAtoms: ProtocolAtoms = {
  baseAPRs: atomWithQuery((get) => ({
    queryKey: ['myprotocol_base_aprs'],
    queryFn: async ({ queryKey }) => {
  })),
  pools: atom((get) => {
    const poolsInfo = get(StrkDexIncentivesAtom);
    const empty: PoolInfo[] = [];
    if (!MyProtocolAtoms.baseAPRs) return empty;
    const baseInfo = get(MyProtocolAtoms.baseAPRs);
    if (poolsInfo.data) {
      const pools = myProtocol._computePoolsInfo(poolsInfo.data);
      return myProtocol.addBaseAPYs(pools, baseInfo);
    }
    return empty;
  }),
};

export default MyProtocolAtoms;
```

6. Import Protocol in `src/store/pools.ts`

```TypeScript
import MyProtocolAtoms, { myProtocol } from './myprotocol.store';
```

7. Add Protocol to `PROTOCOLS` array `src/store/pools.ts`

```TypeScript
export const PROTOCOLS = [
    // other protocols...
    {
        name: myprotocol.name,
        class: myprotocol,
        atoms: MyProtocolAtoms,
    }
]
```
