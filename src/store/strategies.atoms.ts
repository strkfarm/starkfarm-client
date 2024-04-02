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
    const autoStrkStrategy = new AutoTokenStrategy('STRK', "Stake your STRK or zkLend's zSTRK token to receive biweekly DeFi Spring $STRK rewards. The strategy auto-collects your rewards and re-invests them in the zkLend STRK pool, giving you higher return through compounding. You receive frmzSTRK LP token as representation for your stake on STRKFarm. You can withdraw anytime by redeeming your frmzSTRK for zSTRK", 'zSTRK', CONSTANTS.CONTRACTS.AutoStrkFarm);
    const autoUSDCStrategy = new AutoTokenStrategy('USDC', "Stake your USDC or zkLend's zUSDC token to receive biweekly DeFi Spring $STRK rewards. The strategy auto-collects your $STRK rewards, swaps them to USDC and re-invests them in the zkLend USDC pool, giving you higher return through compounding. You receive frmzUSDC LP token as representation for your stake on STRKFarm. You can withdraw anytime by redeeming your frmzUSDC for zUSDC", 'zUSDC', CONSTANTS.CONTRACTS.AutoUsdcFarm);

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

