import { SimpleStableStrategy, StrategyAction } from "@/strategies/simple.stable.strat";
import { atom } from "jotai";
import { allPoolsAtomUnSorted } from "./pools";

export interface StrategyInfo {
    name: string,
    actions: StrategyAction[],
    netYield: number,
    leverage: number,
    rewardTokens: {
        logo: string
    }[]
}

export const strategiesAtom = atom<StrategyInfo[]>((get) => {
    const simpleStableStrat = new SimpleStableStrategy();
    const allPools = get(allPoolsAtomUnSorted);
    const filteredPools = allPools.filter(p => (
        p.protocol.name == 'ZkLend' || p.protocol.name == 'Nostra MM'
    ))

    let strategies: StrategyInfo[] = []

    simpleStableStrat.solve(filteredPools, '1000')
    if (simpleStableStrat.solved) {
        strategies.push({
            name: "USDC-USDT Maxi",
            actions: simpleStableStrat.actions,
            netYield: simpleStableStrat.netYield,
            leverage: simpleStableStrat.leverage,
            rewardTokens: simpleStableStrat.rewardTokens
        })
    }
    return strategies;
})

