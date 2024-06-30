import { IDapp } from '@/store/IDapp.store';
import { BalanceResult, getBalanceAtom } from '@/store/balance.atoms';
import { Category, PoolInfo } from '@/store/pools';
import { zkLend } from '@/store/zklend.store';
import MyNumber from '@/utils/MyNumber';
import { Atom, atom } from 'jotai';
import { AtomWithQueryResult } from 'jotai-tanstack-query';
import { Call, ProviderInterface } from 'starknet';

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

export interface TokenInfo {
  token: string;
  decimals: number;
  displayDecimals: number;
  name: string;
  logo: any;
  minAmount: MyNumber;
  maxAmount: MyNumber;
  stepAmount: MyNumber;
  ekuboPriceKey?: string;
  isERC4626: boolean;
}

export interface NFTInfo {
  name: string;
  address: string;
  logo: any;
  config: {
    mainTokenName: string;
  };
}

export interface StrategyAction {
  pool: PoolInfo;
  amount: string;
  isDeposit: boolean;
  name?: string;
}

export enum StrategyStatus {
  UNINTIALISED = 0,
  SOLVING = 1,
  SOLVED = 2,
}

export enum StrategyLiveStatus {
  ACTIVE = 0,
  COMING_SOON = 1,
  RETIRED = 2,
}

export interface IStrategyActionHook {
  tokenInfo: TokenInfo;
  calls: Call[];
  balanceAtom: Atom<AtomWithQueryResult<BalanceResult, Error>>;
}

export class IStrategyProps {
  readonly liveStatus: StrategyLiveStatus;
  readonly id: string;
  readonly description: string;
  exchanges: IDapp<any>[] = [];

  steps: Step[] = [];

  actions: StrategyAction[] = [];
  netYield: number = 0;
  leverage: number = 0;
  status = StrategyStatus.UNINTIALISED;

  readonly rewardTokens: { logo: string }[];
  readonly holdingTokens: (TokenInfo | NFTInfo)[];

  balEnabled = atom(false);
  readonly balanceAtom: Atom<AtomWithQueryResult<BalanceResult, Error>>;

  risks: string[] = [
    'The strategy involves exposure to smart contracts, which inherently carry risks like hacks, albeit relatively low',
    'APYs shown are just indicative and do not promise exact returns',
  ];

  depositMethods = (
    amount: MyNumber,
    address: string,
    provider: ProviderInterface,
  ): IStrategyActionHook[] => {
    return [];
  };

  withdrawMethods = (
    amount: MyNumber,
    address: string,
    provider: ProviderInterface,
  ): IStrategyActionHook[] => {
    return [];
  };

  constructor(
    id: string,
    description: string,
    rewardTokens: { logo: string }[],
    holdingTokens: (TokenInfo | NFTInfo)[],
    liveStatus: StrategyLiveStatus,
  ) {
    this.id = id;
    this.description = description;
    this.rewardTokens = rewardTokens;
    this.holdingTokens = holdingTokens;
    console.log('calling getBalanceAtom', id, holdingTokens[0]);
    this.balanceAtom = getBalanceAtom(holdingTokens[0], this.balEnabled);
    this.liveStatus = liveStatus;
  }
}

export class IStrategy extends IStrategyProps {
  readonly tag: string;

  constructor(
    id: string,
    tag: string,
    description: string,
    rewardTokens: { logo: string }[],
    holdingTokens: (TokenInfo | NFTInfo)[],
    liveStatus = StrategyLiveStatus.ACTIVE
  ) {
    super(id, description, rewardTokens, holdingTokens, liveStatus);
    this.tag = tag;
  }

  filterStablesOnly(
    pools: PoolInfo[],
    amount: string,
    prevActions: StrategyAction[],
  ) {
    const eligiblePools = pools.filter((p) => p.category == Category.Stable);
    if (!eligiblePools) throw new Error(`${this.tag}: [F1] no eligible pools`);
    return eligiblePools;
  }

  filterSameProtocolNotSameDepositPool(
    pools: PoolInfo[],
    amount: string,
    prevActions: StrategyAction[],
  ) {
    if (prevActions.length == 0)
      throw new Error(
        `${this.tag}: filterSameProtocolNotSameDepositPool - Prev actions zero`,
      );
    const lastAction = prevActions[prevActions.length - 1];
    const eligiblePools = pools
      .filter((p) => p.protocol.name == lastAction.pool.protocol.name)
      .filter((p) => {
        return p.pool.name != lastAction.pool.pool.name;
      });

    if (!eligiblePools) throw new Error(`${this.tag}: [F2] no eligible pools`);
    return eligiblePools;
  }

  filterNotSameProtocolSameDepositPool(
    pools: PoolInfo[],
    amount: string,
    prevActions: StrategyAction[],
  ) {
    if (prevActions.length == 0)
      throw new Error(
        `${this.tag}: filterNotSameProtocolSameDepositPool - Prev actions zero`,
      );
    const lastAction = prevActions[prevActions.length - 1];
    const eligiblePools = pools
      .filter((p) => p.protocol.name != lastAction.pool.protocol.name)
      .filter((p) => {
        return p.pool.name == lastAction.pool.pool.name;
      });

    if (!eligiblePools) throw new Error(`${this.tag}: [F3] no eligible pools`);
    return eligiblePools;
  }

  filterStrkzkLend(
    pools: PoolInfo[],
    amount: string,
    prevActions: StrategyAction[],
  ) {
    return pools.filter(
      (p) => p.pool.name == 'STRK' && p.protocol.name == zkLend.name,
    );
  }

  optimizerDeposit(
    eligiblePools: PoolInfo[],
    amount: string,
    actions: StrategyAction[],
  ) {
    let bestPool: PoolInfo = eligiblePools[0];
    eligiblePools.forEach((p) => {
      if (p.apr > bestPool.apr) {
        bestPool = p;
      }
    });
    return [...actions, { pool: bestPool, amount, isDeposit: true }];
  }

  solve(pools: PoolInfo[], amount: string) {
    this.actions = [];
    let _amount: string = amount;
    let netYield = 0;
    this.status = StrategyStatus.SOLVING;
    try {
      for (let i = 0; i < this.steps.length; ++i) {
        const step = this.steps[i];
        let _pools = [...pools];
        for (let j = 0; j < step.filter.length; ++j) {
          const filter = step.filter[j];
          _pools = filter.bind(this)(_pools, amount, this.actions);
        }

        console.log('solve', i, _pools, pools.length, this.actions, _amount);

        if (_pools.length > 0) {
          this.actions = step.optimizer.bind(this)(
            _pools,
            _amount,
            this.actions,
          );
          if (this.actions.length != i + 1) {
            console.warn(`actions`, this.actions.length, 'i', i);
            throw new Error('one new action per step required');
          }
          this.actions[i].name = step.name;
          _amount = this.actions[this.actions.length - 1].amount;
        } else {
          throw new Error('no pools to continue computing strategy');
        }
      }
    } catch (err) {
      console.warn(`${this.tag} - unsolved`, err);
      return;
    }

    this.actions.forEach((action) => {
      const sign = action.isDeposit ? 1 : -1;
      const apr = action.isDeposit ? action.pool.apr : action.pool.borrow.apr;
      netYield += sign * apr * Number(action.amount);
      console.log('netYield1', sign, apr, action.amount, netYield);
    });
    this.netYield = netYield / Number(amount);
    console.log('netYield', netYield, this.netYield);
    this.leverage = this.netYield / this.actions[0].pool.apr;

    this.postSolve();

    this.status = StrategyStatus.SOLVED;
  }

  postSolve() {}

  isSolved() {
    return this.status === StrategyStatus.SOLVED;
  }

  isSolving() {
    return this.status === StrategyStatus.SOLVING;
  }
}
