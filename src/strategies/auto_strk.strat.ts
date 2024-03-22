import CONSTANTS, { TokenName } from "@/constants";
import { IDapp } from "@/store/IDapp.store";
import { Category, PROTOCOLS, PoolInfo } from "@/store/pools";
import { IStrategy } from "./IStrategy";
import { nostraLending } from "@/store/nostralending.store";
import { zkLend  } from "@/store/zklend.store";

interface Step {
    name: string,
    optimizer: (pools: PoolInfo[], amount: string, prevActions: StrategyAction[]) => StrategyAction[],
    filter: ((pools: PoolInfo[], amount: string, prevActions: StrategyAction[]) => PoolInfo[])[],
}

export interface StrategyAction {
    pool: PoolInfo,
    amount: string,
    isDeposit: boolean,
    name?: string
}

export class AutoTokenStrategy extends IStrategy {

    token: TokenName;
    constructor(token: TokenName, description: string) {
        const rewardTokens = [{logo: CONSTANTS.LOGOS.STRK}];
        super('AutoSTRK', description, rewardTokens);
        this.token = token;

        this.steps = [{
            name: `Deposit ${token}`,
            optimizer: this.optimizer,
            filter: [this.filterStrk],
        }]
    }

    filterStrk(pools: PoolInfo[], amount: string, prevActions: StrategyAction[]) {
        return pools.filter(p => p.pool.name == this.token && p.protocol.name == zkLend.name)
    }

    optimizer(eligiblePools: PoolInfo[], amount: string, actions: StrategyAction[]): StrategyAction[] {
        return [{pool: eligiblePools[0],
            amount,
            isDeposit: true}]
    }

    postSolve() {
        const normalYield = this.netYield;
        this.netYield = (1 + this.netYield/26)**26 - 1; // biweekly compounding
        this.leverage = this.netYield / normalYield;
    }
}
