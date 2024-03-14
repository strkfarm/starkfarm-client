import CONSTANTS from "@/constants";
import axios from 'axios'
import { Category, PoolInfo, StrkDexIncentivesAtom } from "./pools";
import { Ekubo } from "./ekobu.store";
import { atom } from "jotai";

class Jediswap extends Ekubo {
    name = 'Jediswap (v1)'
    link = 'https://app.jediswap.xyz/#/pool'
    logo = 'https://app.jediswap.xyz/favicon/favicon-32x32.png'

    _computePoolsInfo(data: any) {
        const myData = data?.Jediswap_v1;
        if (!myData) return [];
        const pools: PoolInfo[] = [];
        Object.keys(myData).forEach(poolName => {
            const arr = myData[poolName];
            let category = Category.Others;
            if (poolName == 'USDC/USDT') {
                category = Category.Stable
            } else if (poolName.includes('STRK')) {
                category = Category.STRK;
            }

            const poolInfo: PoolInfo = {
                name: poolName,
                protocol: {
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
                category: category
            }
            pools.push(poolInfo);
        })
        console.log('processed pools jedi', pools)
        return pools;
    }

}


const jedi = new Jediswap();
const JediAtoms = {
    pools: atom((get) => {
        const poolsInfo = get(StrkDexIncentivesAtom)
        const empty: PoolInfo[] = [];
        if (poolsInfo.data) return jedi._computePoolsInfo(poolsInfo.data);
        else return empty;
    })
}
export default JediAtoms;