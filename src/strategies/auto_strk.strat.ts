import CONSTANTS, { TOKENS, TokenName } from "@/constants";
import { IDapp } from "@/store/IDapp.store";
import { Category, PROTOCOLS, PoolInfo } from "@/store/pools";
import { IStrategy, TokenInfo } from "./IStrategy";
import { nostraLending } from "@/store/nostralending.store";
import { zkLend  } from "@/store/zklend.store";
import assert from "assert";
import { useAccount, useContract, useContractWrite } from "@starknet-react/core";
import { useEffect, useMemo } from "react";
import ERC20Abi from '@/abi/erc20.abi.json';
import AutoStrkAbi from '@/abi/autoStrk.abi.json';
import MasterAbi from '@/abi/master.abi.json';
import MyNumber from "@/utils/MyNumber";
import { Contract, ProviderInterface, uint256 } from "starknet";

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
    readonly lpTokenName: string;
    readonly strategyAddress: string;

    constructor(token: TokenName, description: string, lpTokenName: string, strategyAddress: string) {
        const rewardTokens = [{logo: CONSTANTS.LOGOS.STRK}];
        const frmToken = TOKENS.find(t => t.token == strategyAddress)
        if (!frmToken) throw new Error('frmToken undefined');
        const holdingTokens = [frmToken]
        super('AutoSTRK', description, rewardTokens, holdingTokens);
        this.token = token;

        this.steps = [{
            name: `Deposit ${token}`,
            optimizer: this.optimizer,
            filter: [this.filterStrk],
        }, {
            name: `Auto-invest Bi-Weekly STRK Rewards`,
            optimizer: this.compounder,
            filter: [this.filterStrk],
        }]
        const _risks = [...this.risks];
        this.risks = [
            `Transfering excess ${lpTokenName} may take your borrows in zkLend near liquidaton. It's safer to deposit ${token} directly.`,
            ..._risks
        ]
        this.lpTokenName = lpTokenName;
        this.strategyAddress = strategyAddress;
    }

    filterStrk(pools: PoolInfo[], amount: string, prevActions: StrategyAction[]) {
        return pools.filter(p => p.pool.name == this.token && p.protocol.name == zkLend.name)
    }

    optimizer(eligiblePools: PoolInfo[], amount: string, actions: StrategyAction[]): StrategyAction[] {
        return [{pool: eligiblePools[0],
            amount,
            isDeposit: true}]
    }

    compounder(eligiblePools: PoolInfo[], amount: string, actions: StrategyAction[]): StrategyAction[] {
        const baseApr = actions[0].pool.apr;
        const compoundingApr = (1 + baseApr/26)**26 - 1
        return [...actions, {pool: {...eligiblePools[0], apr: (compoundingApr - baseApr)},
            amount,
            isDeposit: true}]
    }

    // postSolve() {
    //     const normalYield = this.netYield;
    //     this.netYield = (1 + this.netYield/26)**26 - 1; // biweekly compounding
    //     this.leverage = this.netYield / normalYield;
    // }
    
    depositMethods = (amount: MyNumber, address: string, provider: ProviderInterface) => {
        let baseTokenInfo: TokenInfo = TOKENS.find(t => t.name == this.token) as TokenInfo; //
        let zTokenInfo: TokenInfo = TOKENS.find(t => t.name == this.lpTokenName) as TokenInfo;

        if (!address || address == '0x0') {
            return [{
                tokenInfo: baseTokenInfo,
                calls: []
            },{
                tokenInfo: zTokenInfo,
                calls: []
            }]
        }
        
        const baseTokenContract = new Contract(ERC20Abi, baseTokenInfo.token, provider);
        const zTokenContract = new Contract(ERC20Abi, zTokenInfo.token, provider);
        const masterContract = new Contract(MasterAbi, CONSTANTS.CONTRACTS.Master, provider);
        const strategyContract = new Contract(AutoStrkAbi, this.strategyAddress, provider);

        // base token
        const call11 = baseTokenContract.populate("approve", [masterContract.address, uint256.bnToUint256(amount.toString())])
        const call12 = masterContract.populate("invest_auto_strk", [this.strategyAddress, uint256.bnToUint256(amount.toString()), address])
        
        // zToken
        const call21 = zTokenContract.populate("approve", [this.strategyAddress, uint256.bnToUint256(amount.toString())])
        const call22 = strategyContract.populate("deposit", [uint256.bnToUint256(amount.toString()), address]);

        const calls1 = [call11, call12];
        const calls2 = [call21, call22];

        return [{
            tokenInfo: baseTokenInfo,
            calls: calls1
        }, {
            tokenInfo: zTokenInfo,
            calls: calls2
        }]
    }

    withdrawMethods = (amount: MyNumber, address: string, provider: ProviderInterface) => {
        let frmToken: TokenInfo = TOKENS.find(t => t.token == this.strategyAddress) as TokenInfo;

        if (!address || address == '0x0') {
            return [{
                tokenInfo: frmToken,
                calls: []
            }]
        }
        
        // const baseTokenContract = new Contract(ERC20Abi, baseTokenInfo.token, provider);
        const frmTokenContract = new Contract(ERC20Abi, frmToken.token, provider);
        // const masterContract = new Contract(MasterAbi, CONSTANTS.CONTRACTS.Master, provider);
        const strategyContract = new Contract(AutoStrkAbi, this.strategyAddress, provider);

        // base token
        // const call11 = baseTokenContract.populate("approve", [masterContract.address, uint256.bnToUint256(amount.toString())])
        // const call12 = masterContract.populate("invest_auto_strk", [this.strategyAddress, uint256.bnToUint256(amount.toString()), address])
        
        // zToken
        const call1 = frmTokenContract.populate("approve", [this.strategyAddress, uint256.bnToUint256(amount.toString())])
        const call2 = strategyContract.populate("redeem", [uint256.bnToUint256(amount.toString()), address, address]);

        const calls = [call1, call2];

        return [{
            tokenInfo: frmToken,
            calls
        }]
    }
}
