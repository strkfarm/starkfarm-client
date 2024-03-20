'use client';

import CONSTANTS, { TokenName } from "@/constants";
import axios from 'axios'
import { Category, PoolInfo, PoolType, ProtocolAtoms, StrkDexIncentivesAtom } from "./pools";
import { PrimitiveAtom, atom } from "jotai";
import useSWR from "swr";
import { atomWithQuery } from "jotai-tanstack-query";
const fetcher = (...args: any[]) => {
    return fetch(args[0], args[1]).then(res => res.json())
}

export class Ekubo {
    name = 'Ekubo'
    link = 'https://app.ekubo.org/positions'
    logo = 'https://app.ekubo.org/logo.svg'

    incentiveDataKey = 'Ekubo'
    _computePoolsInfo(data: any) {
        const myData = data[this.incentiveDataKey];
        if (!myData) return [];
        const pools: PoolInfo[] = [];
        Object.keys(myData).filter(this.commonVaultFilter).forEach(poolName => {
            const arr = myData[poolName];
            let category = Category.Others;
            if (poolName == 'USDC/USDT') {
                category = Category.Stable
            } else if (poolName.includes('STRK')) {
                category = Category.STRK;
            }
            
            const tokens: TokenName[] = <TokenName[]>poolName.split('/');
            const logo1 = CONSTANTS.LOGOS[tokens[0]];
            const logo2 = CONSTANTS.LOGOS[tokens[1]];

            const poolInfo: PoolInfo = {
                pool: {
                    name: poolName,
                    logos: [logo1, logo2]
                }, protocol: {
                    name: this.name,
                    link: this.link,
                    logo: this.logo,
                },
                apr: arr[arr.length - 1].apr,
                tvl: arr[arr.length - 1].tvl_usd,
                aprSplits: [{
                    apr: 0,
                    title: 'Base APR',
                    description: 'Subject to position range',
                }, {
                    apr: arr[arr.length - 1].apr,
                    title: 'STRK rewards',
                    description: 'Starknet DeFi Spring incentives',
                }],
                category: category,
                type: PoolType.DEXV3,
                lending: {
                    collateralFactor: 0,
                },
                borrow: {
                    borrowFactor: 0,
                    apr: 0
                }
            }
            pools.push(poolInfo);
        })
        
        return pools;
    }

    commonVaultFilter(poolName: string) {
        return !poolName.includes('DAI') && !poolName.includes('WSTETH') && !poolName.includes('BTC');
    }

}


export const ekubo = new Ekubo();
const EkuboAtoms: ProtocolAtoms = {
    pools: atom((get) => {
        const poolsInfo = get(StrkDexIncentivesAtom)
        const empty: PoolInfo[] = [];
        if (poolsInfo.data) return ekubo._computePoolsInfo(poolsInfo.data);
        else return empty;
    })
}
export default EkuboAtoms;