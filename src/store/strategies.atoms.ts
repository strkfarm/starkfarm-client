import { SimpleStableStrategy, StrategyAction } from "@/strategies/simple.stable.strat";
import { atom } from "jotai";
import { allPoolsAtomUnSorted } from "./pools";
import { AutoTokenStrategy } from "@/strategies/auto_strk.strat";

export interface StrategyInfo {
    name: string,
    description: string,
    actions: StrategyAction[],
    netYield: number,
    leverage: number,
    rewardTokens: {
        logo: string
    }[]
}

export const strategiesAtom = atom<StrategyInfo[]>((get) => {
    const simpleStableStrat = new SimpleStableStrategy();
    const autoStrkStrategy = new AutoTokenStrategy('STRK', "Auto collect $STRK biweekly and re-invest");
    const autoUSDCStrategy = new AutoTokenStrategy('USDC', "Auto collect $STRK biweekly, swap and re-invest");

    const allPools = get(allPoolsAtomUnSorted);
    const filteredPools = allPools.filter(p => (
        p.protocol.name == 'ZkLend' || p.protocol.name == 'Nostra MM'
    ))

    let strategies: StrategyInfo[] = []

    simpleStableStrat.solve(filteredPools, '1000')
    autoStrkStrategy.solve(filteredPools, '1000')
    autoUSDCStrategy.solve(filteredPools, '1000')
    if (autoStrkStrategy.solved) {
        strategies.push({
            name: "Auto Compounding STRK",
            description: autoStrkStrategy.description,
            actions: autoStrkStrategy.actions,
            netYield: autoStrkStrategy.netYield,
            leverage: autoStrkStrategy.leverage,
            rewardTokens: autoStrkStrategy.rewardTokens
        })
    }
    if (autoUSDCStrategy.solved) {
        strategies.push({
            name: "Auto Compounding USDC",
            description: autoUSDCStrategy.description,
            actions: autoUSDCStrategy.actions,
            netYield: autoUSDCStrategy.netYield,
            leverage: autoUSDCStrategy.leverage,
            rewardTokens: autoUSDCStrategy.rewardTokens
        })
    }
    if (simpleStableStrat.solved) {
        strategies.push({
            name: "USDC-USDT Maxi",
            description: simpleStableStrat.description,
            actions: simpleStableStrat.actions,
            netYield: simpleStableStrat.netYield,
            leverage: simpleStableStrat.leverage,
            rewardTokens: simpleStableStrat.rewardTokens
        })
    }
    return strategies;
})

