import CONSTANTS from '@/constants';
import { IDapp } from '@/store/IDapp.store';
import { PROTOCOLS, PoolInfo } from '@/store/pools';
import { IStrategy } from './IStrategy';

interface Step {
  name: string;
  optimizer: (
    pools: PoolInfo[],
    amount: string,
    prevActions: StrategyAction[],
  ) => StrategyAction[];
  filter: ((
    pools: PoolInfo[],
    amount: string,
    prevActions: StrategyAction[],
  ) => PoolInfo[])[];
}

export interface StrategyAction {
  pool: PoolInfo;
  amount: string;
  isDeposit: boolean;
  name?: string;
}

export class SimpleStableStrategy extends IStrategy {
  tag = 'SSStrt';
  exchanges: IDapp<any>[] = [];

  actions: StrategyAction[] = [];
  netYield: number = 0;
  leverage: number = 0;
  solved = false;

  constructor() {
    const rewardTokens = [
      { logo: CONSTANTS.LOGOS.STRK },
      { logo: CONSTANTS.LOGOS.USDC },
      { logo: CONSTANTS.LOGOS.USDT },
    ];
    super(`SSStrt_mm_usdc_usdt`, 'SSStrt', 'Loop stable-coins to maximize yield', rewardTokens, []);

    this.steps = [
      {
        name: 'Deposit to best pool',
        optimizer: this.optimizerDeposit,
        filter: [this.filterStablesOnly],
      },
      {
        name: 'Borrow from same protocol keeping HF > 1.2',
        optimizer: (pools, amount, actions) => {
          let bestPool: PoolInfo = pools[0];
          pools.forEach((p) => {
            if (p.borrow.apr < bestPool.borrow.apr) {
              bestPool = p;
            }
          });
          const protocolInfo: any = PROTOCOLS.find(
            (p) => p.name === bestPool.protocol.name,
          );
          if (!protocolInfo)
            throw new Error(`${this.tag} Protocol info not found`);
          const protocolClass: IDapp<any> = protocolInfo.class;
          const factoredAmount = protocolClass.getMaxFactoredOut(actions, 1.2);
          const newAmount = factoredAmount * bestPool.borrow.borrowFactor;
          const newAction: StrategyAction = {
            pool: bestPool,
            amount: newAmount.toFixed(0),
            isDeposit: false,
          };
          return [...actions, newAction];
        },
        filter: [
          this.filterStablesOnly,
          this.filterSameProtocolNotSameDepositPool,
        ],
      },
      {
        name: 'Deposit borrowed amount to another protocol',
        optimizer: this.optimizerDeposit,
        filter: [
          this.filterStablesOnly,
          this.filterNotSameProtocolSameDepositPool,
        ],
      },
    ];
  }
}
