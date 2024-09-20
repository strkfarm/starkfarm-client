import { atom } from 'jotai';
import { AutoTokenStrategy } from '@/strategies/auto_strk.strat';
import {
  IStrategy,
  IStrategyProps,
  StrategyLiveStatus,
} from '@/strategies/IStrategy';
import CONSTANTS from '@/constants';
import { DeltaNeutralMM } from '@/strategies/delta_neutral_mm';
import Mustache from 'mustache';
import { getTokenInfoFromName } from '@/utils';
import { allPoolsAtomUnSorted } from './protocols';

export interface StrategyInfo extends IStrategyProps {
  name: string;
}

export function getStrategies() {
  // const simpleStableStrat = new SimpleStableStrategy();
  const autoStrkStrategy = new AutoTokenStrategy(
    'STRK',
    'Auto Compounding STRK',
    "Stake your STRK or zkLend's zSTRK token to receive DeFi Spring $STRK rewards every 14 days. The strategy auto-collects your rewards and re-invests them in the zkLend STRK pool, giving you higher return through compounding. You receive frmzSTRK LP token as representation for your stake on STRKFarm. You can withdraw anytime by redeeming your frmzSTRK for zSTRK and see your STRK in zkLend.",
    'zSTRK',
    CONSTANTS.CONTRACTS.AutoStrkFarm,
    {
      maxTVL: 2000000,
    },
  );
  const autoUSDCStrategy = new AutoTokenStrategy(
    'USDC',
    'Auto Compounding USDC',
    "Stake your USDC or zkLend's zUSDC token to receive DeFi Spring $STRK rewards every 14 days. The strategy auto-collects your $STRK rewards, swaps them to USDC and re-invests them in the zkLend USDC pool, giving you higher return through compounding. You receive frmzUSDC LP token as representation for your stake on STRKFarm. You can withdraw anytime by redeeming your frmzUSDC for zUSDC and see your STRK in zkLend.",
    'zUSDC',
    CONSTANTS.CONTRACTS.AutoUsdcFarm,
    {
      maxTVL: 2000000,
    },
  );

  const DNMMDescription = `Deposit your {{token1}} to automatically loop your funds between zkLend and Nostra to create a delta neutral position. This strategy is designed to maximize your yield on {{token1}}. Your position is automatically adjusted periodically to maintain a healthy health factor. You receive a NFT as representation for your stake on STRKFarm. You can withdraw anytime by redeeming your NFT for {{token1}}.`;
  const usdcTokenInfo = getTokenInfoFromName('USDC');
  const deltaNeutralMMUSDCETH = new DeltaNeutralMM(
    usdcTokenInfo,
    'USDC Sensei',
    Mustache.render(DNMMDescription, { token1: 'USDC', token2: 'ETH' }),
    'ETH',
    CONSTANTS.CONTRACTS.DeltaNeutralMMUSDCETH,
    [1, 0.615384615, 1, 0.584615385, 0.552509024], // precomputed factors based on strategy math
    StrategyLiveStatus.NEW,
    {
      maxTVL: 500000,
    },
  );

  const deltaNeutralMMETHUSDC = new DeltaNeutralMM(
    getTokenInfoFromName('ETH'),
    'ETH Sensei',
    Mustache.render(DNMMDescription, { token1: 'ETH', token2: 'USDC' }),
    'USDC',
    CONSTANTS.CONTRACTS.DeltaNeutralMMETHUSDC,
    [1, 0.609886, 1, 0.920975, 0.510078], // precomputed factors based on strategy math
    StrategyLiveStatus.NEW,
    {
      maxTVL: 100,
    },
  );
  const deltaNeutralMMSTRKETH = new DeltaNeutralMM(
    getTokenInfoFromName('STRK'),
    'STRK Sensei',
    Mustache.render(DNMMDescription, { token1: 'STRK', token2: 'ETH' }),
    'ETH',
    CONSTANTS.CONTRACTS.DeltaNeutralMMSTRKETH,
    [1, 0.384615, 1, 0.492308, 0.233276], // precomputed factors based on strategy math, last is the excess deposit1 that is happening
    StrategyLiveStatus.NEW,
    {
      maxTVL: 500000,
    },
  );

  const strategies: IStrategy[] = [
    autoStrkStrategy,
    autoUSDCStrategy,
    deltaNeutralMMUSDCETH,
    deltaNeutralMMETHUSDC,
    deltaNeutralMMSTRKETH,
  ];

  return strategies;
}

export const STRATEGIES_INFO = getStrategies();

export const strategiesAtom = atom<StrategyInfo[]>((get) => {
  const strategies = getStrategies();
  const allPools = get(allPoolsAtomUnSorted);
  const requiredPools = allPools.filter(
    (p) => p.protocol.name === 'zkLend' || p.protocol.name === 'Nostra',
  );

  for (const s of strategies) {
    s.solve(requiredPools, '1000');
  }

  strategies.sort((a, b) => {
    const status1 = getLiveStatusNumber(a.liveStatus);
    const status2 = getLiveStatusNumber(b.liveStatus);
    return status1 - status2 || b.netYield - a.netYield;
  });
  return strategies;
});

function getLiveStatusNumber(status: StrategyLiveStatus) {
  if (status == StrategyLiveStatus.NEW) {
    return 1;
  } else if (status == StrategyLiveStatus.ACTIVE) {
    return 2;
  } else if (status == StrategyLiveStatus.COMING_SOON) {
    return 3;
  }
  return 4;
}
