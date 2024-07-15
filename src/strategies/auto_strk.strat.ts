import CONSTANTS, { TOKENS, TokenName } from '@/constants';
import { PoolInfo } from '@/store/pools';
import { IStrategy, TokenInfo } from './IStrategy';
import ERC20Abi from '@/abi/erc20.abi.json';
import AutoStrkAbi from '@/abi/autoStrk.abi.json';
import MasterAbi from '@/abi/master.abi.json';
import MyNumber from '@/utils/MyNumber';
import { Contract, ProviderInterface, uint256 } from 'starknet';
import { atom } from 'jotai';
import {
  DUMMY_BAL_ATOM,
  getBalanceAtom,
  getERC20BalanceAtom,
} from '@/store/balance.atoms';

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

export class AutoTokenStrategy extends IStrategy {
  token: TokenName;
  readonly lpTokenName: string;
  readonly strategyAddress: string;

  constructor(
    token: TokenName,
    description: string,
    lpTokenName: string,
    strategyAddress: string,
  ) {
    const rewardTokens = [{ logo: CONSTANTS.LOGOS.STRK }];
    const frmToken = TOKENS.find((t) => t.token == strategyAddress);
    if (!frmToken) throw new Error('frmToken undefined');
    const holdingTokens = [frmToken];

    super(
      `auto_token_${token}`,
      'AutoSTRK',
      description,
      rewardTokens,
      holdingTokens,
    );
    this.token = token;

    this.steps = [
      {
        name: `Supplies your ${token} to zkLend`,
        optimizer: this.optimizer,
        filter: [this.filterStrkzkLend],
      },
      {
        name: `Re-invest your STRK Rewards every 14 days`,
        optimizer: this.compounder,
        filter: [this.filterStrkzkLend],
      },
    ];
    const _risks = [...this.risks];
    this.risks = [
      `Safety score: 4.5/5`,
      `Your original investment is safe. If you deposit 100 tokens, you will always get at least 100 tokens back, unless due to below reasons.`,
      `Transfering excess ${lpTokenName} may take your borrows in zkLend near liquidaton. It's safer to deposit ${token} directly.`,
      ..._risks,
    ];
    this.lpTokenName = lpTokenName;
    this.strategyAddress = strategyAddress;
  }

  optimizer(
    eligiblePools: PoolInfo[],
    amount: string,
    actions: StrategyAction[],
  ): StrategyAction[] {
    return [{ pool: eligiblePools[0], amount, isDeposit: true }];
  }

  compounder(
    eligiblePools: PoolInfo[],
    amount: string,
    actions: StrategyAction[],
  ): StrategyAction[] {
    const baseApr = actions[0].pool.apr;
    const compoundingApr = (1 + baseApr / 26) ** 26 - 1;
    return [
      ...actions,
      {
        pool: { ...eligiblePools[0], apr: compoundingApr - baseApr },
        amount,
        isDeposit: true,
      },
    ];
  }

  // postSolve() {
  //     const normalYield = this.netYield;
  //     this.netYield = (1 + this.netYield/26)**26 - 1; // biweekly compounding
  //     this.leverage = this.netYield / normalYield;
  // }

  depositMethods = (
    amount: MyNumber,
    address: string,
    provider: ProviderInterface,
  ) => {
    const baseTokenInfo: TokenInfo = TOKENS.find(
      (t) => t.name == this.token,
    ) as TokenInfo; //
    const zTokenInfo: TokenInfo = TOKENS.find(
      (t) => t.name == this.lpTokenName,
    ) as TokenInfo;

    if (!address || address == '0x0') {
      return [
        {
          tokenInfo: baseTokenInfo,
          calls: [],
          balanceAtom: DUMMY_BAL_ATOM,
        },
        {
          tokenInfo: zTokenInfo,
          calls: [],
          balanceAtom: DUMMY_BAL_ATOM,
        },
      ];
    }

    const baseTokenContract = new Contract(
      ERC20Abi,
      baseTokenInfo.token,
      provider,
    );
    const zTokenContract = new Contract(ERC20Abi, zTokenInfo.token, provider);
    const masterContract = new Contract(
      MasterAbi,
      CONSTANTS.CONTRACTS.Master,
      provider,
    );
    const strategyContract = new Contract(
      AutoStrkAbi,
      this.strategyAddress,
      provider,
    );

    // base token
    const call11 = baseTokenContract.populate('approve', [
      masterContract.address,
      uint256.bnToUint256(amount.toString()),
    ]);
    const call12 = masterContract.populate('invest_auto_strk', [
      this.strategyAddress,
      uint256.bnToUint256(amount.toString()),
      address,
    ]);

    // zToken
    const call21 = zTokenContract.populate('approve', [
      this.strategyAddress,
      uint256.bnToUint256(amount.toString()),
    ]);
    const call22 = strategyContract.populate('deposit', [
      uint256.bnToUint256(amount.toString()),
      address,
    ]);

    const calls1 = [call11, call12];
    const calls2 = [call21, call22];

    return [
      {
        tokenInfo: baseTokenInfo,
        calls: calls1,
        balanceAtom: getBalanceAtom(baseTokenInfo, atom(true)),
      },
      {
        tokenInfo: zTokenInfo,
        calls: calls2,
        balanceAtom: getBalanceAtom(zTokenInfo, atom(true)),
      },
    ];
  };

  withdrawMethods = (
    amount: MyNumber,
    address: string,
    provider: ProviderInterface,
  ) => {
    const frmToken: TokenInfo = TOKENS.find(
      (t) => t.token == this.strategyAddress,
    ) as TokenInfo;

    if (!address || address == '0x0') {
      return [
        {
          tokenInfo: frmToken,
          calls: [],
          balanceAtom: DUMMY_BAL_ATOM,
        },
      ];
    }

    // const baseTokenContract = new Contract(ERC20Abi, baseTokenInfo.token, provider);
    const frmTokenContract = new Contract(ERC20Abi, frmToken.token, provider);
    // const masterContract = new Contract(MasterAbi, CONSTANTS.CONTRACTS.Master, provider);
    const strategyContract = new Contract(
      AutoStrkAbi,
      this.strategyAddress,
      provider,
    );

    // base token
    // const call11 = baseTokenContract.populate("approve", [masterContract.address, uint256.bnToUint256(amount.toString())])
    // const call12 = masterContract.populate("invest_auto_strk", [this.strategyAddress, uint256.bnToUint256(amount.toString()), address])

    // zToken
    const call1 = frmTokenContract.populate('approve', [
      this.strategyAddress,
      uint256.bnToUint256(amount.toString()),
    ]);
    const call2 = strategyContract.populate('redeem', [
      uint256.bnToUint256(amount.toString()),
      address,
      address,
    ]);

    const calls = [call1, call2];

    return [
      {
        tokenInfo: frmToken,
        calls,
        balanceAtom: getERC20BalanceAtom(frmToken),
      },
    ];
  };
}
