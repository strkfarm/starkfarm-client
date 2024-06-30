import { SimpleStableStrategy } from '@/strategies/simple.stable.strat';
import { atom } from 'jotai';
import { allPoolsAtomUnSorted } from './pools';
import { AutoTokenStrategy } from '@/strategies/auto_strk.strat';
import { IStrategyProps, StrategyLiveStatus } from '@/strategies/IStrategy';
import CONSTANTS from '@/constants';
import { DeltaNeutralMM } from '@/strategies/delta_neutral_mm';
import Mustache from 'mustache';

export interface StrategyInfo extends IStrategyProps {
  name: string;
}

export const strategiesAtom = atom<StrategyInfo[]>((get) => {
  const simpleStableStrat = new SimpleStableStrategy();
  const autoStrkStrategy = new AutoTokenStrategy(
    'STRK',
    "Stake your STRK or zkLend's zSTRK token to receive DeFi Spring $STRK rewards every 14 days. The strategy auto-collects your rewards and re-invests them in the zkLend STRK pool, giving you higher return through compounding. You receive frmzSTRK LP token as representation for your stake on STRKFarm. You can withdraw anytime by redeeming your frmzSTRK for zSTRK and see your STRK in zkLend.",
    'zSTRK',
    CONSTANTS.CONTRACTS.AutoStrkFarm,
  );
  const autoUSDCStrategy = new AutoTokenStrategy(
    'USDC',
    "Stake your USDC or zkLend's zUSDC token to receive DeFi Spring $STRK rewards every 14 days. The strategy auto-collects your $STRK rewards, swaps them to USDC and re-invests them in the zkLend USDC pool, giving you higher return through compounding. You receive frmzUSDC LP token as representation for your stake on STRKFarm. You can withdraw anytime by redeeming your frmzUSDC for zUSDC and see your STRK in zkLend.",
    'zUSDC',
    CONSTANTS.CONTRACTS.AutoUsdcFarm,
  );

  const DNMMDescription = `Deposit your {{token1}} to automatically loop your funds between zkLend and Nostra to create a delta neutral position. This strategy is designed to maximize your yield on {{token1}}. Your position is automatically adjusted periodically to maintain a healthy health factor. Your receive a NFT as representation for your stake on STRKFarm. You can withdraw anytime by redeeming your NFT for {{token1}}.`;
  const deltaNeutralMMUSDCETH = new DeltaNeutralMM(
    'USDC',
    Mustache.render(DNMMDescription, { token1: 'USDC', token2: 'ETH' }),
    'ETH',
    CONSTANTS.CONTRACTS.DeltaNeutralMMUSDCETH,
    [1.52, 0.618, 1, 0.553, 1.923], // precomputed factors based on strategy math
    StrategyLiveStatus.COMING_SOON,
  );

  const deltaNeutralMMETHUSDC = new DeltaNeutralMM(
    'ETH',
    Mustache.render(DNMMDescription, { token1: 'ETH', token2: 'USDC' }),
    'USDC',
    // ! change this later
    CONSTANTS.CONTRACTS.DeltaNeutralMMUSDCETH,
    [1.52, 0.618, 1, 0.553, 1.923],
    StrategyLiveStatus.COMING_SOON,
  );
  const deltaNeutralMMSTRKUSDC = new DeltaNeutralMM(
    'STRK',
    Mustache.render(DNMMDescription, { token1: 'STRK', token2: 'USDC' }),
    'USDC',
    // ! change this later
    CONSTANTS.CONTRACTS.DeltaNeutralMMUSDCETH,
    [1.52, 0.618, 1, 0.553, 1.923],
    StrategyLiveStatus.COMING_SOON,
  );

  const allPools = get(allPoolsAtomUnSorted);
  const filteredPools = allPools.filter(
    (p) => p.protocol.name === 'zkLend' || p.protocol.name === 'Nostra MM',
  );

  const strategies: StrategyInfo[] = [];

  simpleStableStrat.solve(filteredPools, '1000');
  autoStrkStrategy.solve(filteredPools, '1000');
  autoUSDCStrategy.solve(filteredPools, '1000');
  deltaNeutralMMUSDCETH.solve(filteredPools, '1000');
  deltaNeutralMMETHUSDC.solve(filteredPools, '1000');
  deltaNeutralMMSTRKUSDC.solve(filteredPools, '1000');
  strategies.push({
    name: 'Auto Compounding STRK',
    ...autoStrkStrategy,
  });
  strategies.push({
    name: 'Auto Compounding USDC',
    ...autoUSDCStrategy,
  });
  strategies.push({
    name: 'Stable Lending Maxi',
    ...deltaNeutralMMUSDCETH,
  });
  strategies.push({
    name: 'ETH Lending Maxi',
    ...deltaNeutralMMETHUSDC,
  });
  strategies.push({
    name: 'STRK Lending Maxi',
    ...deltaNeutralMMSTRKUSDC,
  });
  // strategies.push({
  //     name: "USDC-USDT Maxi",
  //     .
  // })
  strategies.sort((a, b) => {
    return a.liveStatus - b.liveStatus || b.netYield - a.netYield;
  });
  return strategies;
});
