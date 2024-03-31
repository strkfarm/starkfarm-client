import { SimpleStableStrategy, StrategyAction } from "@/strategies/simple.stable.strat";
import { atom } from "jotai";
import { allPoolsAtomUnSorted } from "./pools";
import { AutoTokenStrategy } from "@/strategies/auto_strk.strat";
import { IStrategy, IStrategyProps, StrategyStatus } from "@/strategies/IStrategy";
import CONSTANTS from "@/constants";

export interface StrategyInfo extends IStrategyProps {
    name: string
}

export const strategiesAtom = atom<StrategyInfo[]>((get) => {
    const simpleStableStrat = new SimpleStableStrategy();
    const autoStrkStrategy = new AutoTokenStrategy('STRK', "Auto collect $STRK biweekly and re-invest. You receive frmzSTRK LP token for depositing STRK or zSTRK (zklend STRK). You can withdraw by redeeming your frmzSTRK for zSTRK", 'zSTRK', CONSTANTS.CONTRACTS.AutoStrkFarm);
    const autoUSDCStrategy = new AutoTokenStrategy('USDC', "Auto collect $STRK biweekly, swap and re-invest. You receive frmzUSDC LP token for depositing USDC or zUSDC (zklend USDC). You can withdraw by redeeming your frmzUSDC for zUSDC", 'zUSDC', CONSTANTS.CONTRACTS.AutoUsdcFarm);

    const allPools = get(allPoolsAtomUnSorted) ;
    const filteredPools = allPools.filter(p => (
        p.protocol.name == 'ZkLend' || p.protocol.name == 'Nostra MM'
    ))

    let strategies: StrategyInfo[] = []

    simpleStableStrat.solve(filteredPools, '1000')
    autoStrkStrategy.solve(filteredPools, '1000')
    autoUSDCStrategy.solve(filteredPools, '1000')
    strategies.push({
        name: "Auto Compounding STRK",
        ...autoStrkStrategy
    })
    strategies.push({
        name: "Auto Compounding USDC",
        ...autoUSDCStrategy
    })
    // strategies.push({
    //     name: "USDC-USDT Maxi",
    //     .
    // })
    return strategies;
})

