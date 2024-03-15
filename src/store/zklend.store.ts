'use client';

import CONSTANTS, { TokenName } from "@/constants";
import axios from 'axios'
import { Category, PoolInfo, PoolType, ProtocolAtoms, StrkDexIncentivesAtom, StrkLendingIncentivesAtom } from "./pools";
import { PrimitiveAtom, atom } from "jotai";
import useSWR from "swr";
const fetcher = (...args: any[]) => {
    return fetch(args[0], args[1]).then(res => res.json())
}

export class ZkLend {
    name = 'ZkLend'
    link = 'https://app.zklend.com/markets'
    logo = 'https://app.zklend.com/favicon.ico'

    incentiveDataKey = 'zkLend'
    _computePoolsInfo(data: any) {
        const myData = data[this.incentiveDataKey];
        if (!myData) return [];
        const pools: PoolInfo[] = [];
        Object.keys(myData).forEach(poolName => {
            const arr = myData[poolName];
            if (arr.length == 0) return;

            let category = Category.Others;
            if (['USDC', 'USDT'].includes(poolName)) {
                category = Category.Stable
            } else if (poolName.includes('STRK')) {
                category = Category.STRK;
            }
            
            const logo1 = CONSTANTS.LOGOS[<TokenName>poolName];

            const poolInfo: PoolInfo = {
                pool: {
                    name: poolName,
                    logos: [logo1]
                }, protocol: {
                    name: this.name,
                    link: this.link,
                    logo: this.logo,
                },
                apr: arr[arr.length - 1].strk_grant_apr_nrs,
                tvl: arr[arr.length - 1].supply_usd,
                aprSplits: [{
                    apr: 0,
                    title: 'Base APR',
                    description: 'Shown soon',
                }, {
                    apr: arr[arr.length - 1].strk_grant_apr_nrs,
                    title: 'STRK rewards',
                    description: 'Starknet DeFi Spring incentives',
                }],
                category: category,
                type: PoolType.Lending
            }
            pools.push(poolInfo);
        })
        
        return pools;
    }

}

export const zkLend = new ZkLend();
const ZkLendAtoms: ProtocolAtoms = {
    pools: atom((get) => {
        const poolsInfo = get(StrkLendingIncentivesAtom)
        const empty: PoolInfo[] = [];
        if (poolsInfo.data) return zkLend._computePoolsInfo(poolsInfo.data);
        else return empty;
    })
}
export default ZkLendAtoms;