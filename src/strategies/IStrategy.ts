import CONSTANTS from "@/constants";
import { IDapp } from "@/store/IDapp.store";
import { Category, PROTOCOLS, PoolInfo } from "@/store/pools";
import MyNumber from "@/utils/MyNumber";
import { UseContractWriteResult } from "@starknet-react/core";
import { Call, ProviderInterface } from "starknet";

interface Step {
    name: string,
    optimizer: (pools: PoolInfo[], amount: string, prevActions: StrategyAction[]) => StrategyAction[],
    filter: ((pools: PoolInfo[], amount: string, prevActions: StrategyAction[]) => PoolInfo[])[],
}

export interface TokenInfo {
    token: string,
    decimals: number,
    displayDecimals: number,
    name: string,
    logo: any,
    minAmount: MyNumber,
    maxAmount: MyNumber,
    stepAmount: MyNumber,
}

export interface StrategyAction {
    pool: PoolInfo,
    amount: string,
    isDeposit: boolean,
    name?: string
}

export enum StrategyStatus {
    UNINTIALISED = 0,
    SOLVING = 1,
    SOLVED = 2
}

export interface IStrategyActionHook {
    tokenInfo: TokenInfo, 
    calls: Call[]
}

export class IStrategyProps {
    readonly description: string;
    exchanges: IDapp<any>[] = [];

    steps: Step[] = [];

    actions: StrategyAction[] = [];
    netYield: number = 0;
    leverage: number = 0;
    status = StrategyStatus.UNINTIALISED;

    readonly rewardTokens: {logo: string}[];
    
    readonly holdingTokens: TokenInfo[];

    risks: string[] = [
        "The strategy encompasses exposure to the protocols and tokens listed above, which inherently entail a spectrum of risks including, but not limited to, hacks and volatility",
        "APYs shown are just indicative and do not promise exact returns",
    ];

    depositMethods = (amount: MyNumber, address: string, provider: ProviderInterface):  IStrategyActionHook[] => {
        return [];
    };

    withdrawMethods = (amount: MyNumber, address: string, provider: ProviderInterface):  IStrategyActionHook[] => {
        return [];
    };

    constructor(description: string, rewardTokens: {logo: string}[], holdingTokens: TokenInfo[]) {
        this.description = description;
        this.rewardTokens = rewardTokens;
        this.holdingTokens = holdingTokens;
    }
}

export class IStrategy extends IStrategyProps {
    readonly tag: string;

    constructor(tag: string, description: string, rewardTokens: {logo: string}[], holdingTokens: TokenInfo[]) {
        super(description, rewardTokens, holdingTokens);
        this.tag = tag;
    }

    filterStablesOnly(pools: PoolInfo[], amount: string, prevActions: StrategyAction[]) {
        const eligiblePools = pools.filter(p => p.category == Category.Stable);
        if (!eligiblePools) throw new Error(`${this.tag}: [F1] no eligible pools`);
        return eligiblePools;
    }

    filterSameProtocolNotSameDepositPool(pools: PoolInfo[], amount: string, prevActions: StrategyAction[]) {
        if (prevActions.length == 0) throw new Error(`${this.tag}: filterSameProtocolNotSameDepositPool - Prev actions zero`);
        const lastAction = prevActions[prevActions.length - 1];
        const eligiblePools = pools.filter(p => p.protocol.name == lastAction.pool.protocol.name).filter(p => {
            return p.pool.name != lastAction.pool.pool.name;
        });

        if (!eligiblePools) throw new Error(`${this.tag}: [F2] no eligible pools`);
        return eligiblePools;
    }

    filterNotSameProtocolSameDepositPool(pools: PoolInfo[], amount: string, prevActions: StrategyAction[]) {
        if (prevActions.length == 0) throw new Error(`${this.tag}: filterNotSameProtocolSameDepositPool - Prev actions zero`);
        const lastAction = prevActions[prevActions.length - 1];
        const eligiblePools = pools.filter(p => p.protocol.name != lastAction.pool.protocol.name).filter(p => {
            return p.pool.name == lastAction.pool.pool.name;
        });

        if (!eligiblePools) throw new Error(`${this.tag}: [F3] no eligible pools`);
        return eligiblePools;
    }

    optimizerDeposit(eligiblePools: PoolInfo[], amount: string, actions: StrategyAction[]) {
        let bestPool: PoolInfo = eligiblePools[0];
        eligiblePools.forEach(p => {
            if (p.apr > bestPool.apr) {
                bestPool = p;
            }
        });
        return [...actions, {pool: bestPool, amount, isDeposit: true}];
    }

    solve(pools: PoolInfo[], amount: string) {
        this.actions = [];
        let _amount: string = amount;
        let netYield = 0;
        this.status = StrategyStatus.SOLVING;
        try {
            for (let i=0; i<this.steps.length; ++i) {
                const step = this.steps[i];
                let _pools = [...pools];
                for (let j=0; j<step.filter.length; ++j) {
                    const filter = step.filter[j];
                    _pools = filter.bind(this)(_pools, amount, this.actions);
                }

                console.log('solve', i, _pools, pools.length, this.actions, _amount);

                if (_pools.length > 0) {
                    this.actions = step.optimizer(_pools, _amount, this.actions);
                    if (this.actions.length != (i + 1)) {
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

        this.actions.forEach(action => {
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
        return this.status == StrategyStatus.SOLVED;
    }

    isSolving() {
        return this.status == StrategyStatus.SOLVING;
    }
}