import CONSTANTS, { NFTS, TOKENS, TokenName } from '@/constants';
import { PoolInfo } from '@/store/pools';
import { IStrategy, NFTInfo, StrategyLiveStatus, TokenInfo } from './IStrategy';
import { zkLend } from '@/store/zklend.store';
import ERC20Abi from '@/abi/erc20.abi.json';
import DeltaNeutralAbi from '@/abi/deltraNeutral.abi.json';
import MyNumber from '@/utils/MyNumber';
import { Call, Contract, ProviderInterface, uint256 } from 'starknet';
import { nostraLending } from '@/store/nostralending.store';
import { standariseAddress } from '@/utils';
import { DUMMY_BAL_ATOM, getBalanceAtom } from '@/store/balance.atoms';
import { atom } from 'jotai';

export interface StrategyAction {
  pool: PoolInfo;
  amount: string;
  isDeposit: boolean;
  name?: string;
}

export class DeltaNeutralMM extends IStrategy {
  token: TokenName;
  readonly secondaryToken: string;
  readonly strategyAddress: string;
  // Factor of Amount to be deposited/borrowed at each step relative to the previous step
  readonly stepAmountFactors: number[];

  constructor(
    token: TokenName,
    description: string,
    secondaryTokenName: TokenName,
    strategyAddress: string,
    stepAmountFactors: number[],
    liveStatus: StrategyLiveStatus,
  ) {
    const rewardTokens = [{ logo: CONSTANTS.LOGOS.STRK }];
    const nftInfo = NFTS.find(
      (nft) =>
        standariseAddress(nft.address) == standariseAddress(strategyAddress),
    );
    if (!nftInfo) {
      throw new Error('DeltaMM: NFT not found');
    }
    const holdingTokens: (TokenInfo | NFTInfo)[] = [nftInfo];
    super(
      `delta_neutral_mm_${token}`,
      'DeltaNeutralMM',
      description,
      rewardTokens,
      holdingTokens,
      liveStatus,
    );
    this.token = token;

    this.steps = [
      {
        name: `Supplies your ${token} to zkLend [1.52x]`,
        optimizer: this.optimizer,
        filter: [this.filterMainToken],
      },
      {
        name: `Borrow ${secondaryTokenName} from zkLend`,
        optimizer: this.optimizer,
        filter: [this.filterSecondaryToken],
      },
      {
        name: `Deposit ${secondaryTokenName} to Nostra`,
        optimizer: this.optimizer,
        filter: [this.filterSecondaryToken],
      },
      {
        name: `Borrow ${token} from Nostra`,
        optimizer: this.optimizer,
        filter: [this.filterMainToken],
      },
      {
        name: `Re-invest your STRK Rewards every 14 days`,
        optimizer: this.compounder,
        filter: [this.filterStrkzkLend],
      },
    ];

    if (stepAmountFactors.length != this.steps.length) {
      throw new Error(
        'stepAmountFactors length should be equal to steps length',
      );
    }
    this.stepAmountFactors = stepAmountFactors;

    const _risks = [...this.risks];
    this.risks = [
      `Safety score: 4.25/5`,
      `For upto 2 weeks, your position value may reduce due to high borrow APR. This will be compensated by STRK rewards.`,
      `Your original investment is safe. If you deposit 100 tokens, you will always get at least 100 tokens back, unless due to below reasons.`,
      `Technical failures in rebalancing positions to maintain healthy health factor may result in liquidations.`,
      ..._risks,
    ];
    this.secondaryToken = secondaryTokenName;
    this.strategyAddress = strategyAddress;
  }

  filterMainToken(
    pools: PoolInfo[],
    amount: string,
    prevActions: StrategyAction[],
  ) {
    const dapp = prevActions.length == 0 ? zkLend : nostraLending;
    return pools.filter(
      (p) => p.pool.name == this.token && p.protocol.name == dapp.name,
    );
  }

  filterSecondaryToken(
    pools: PoolInfo[],
    amount: string,
    prevActions: StrategyAction[],
  ) {
    const dapp = prevActions.length == 1 ? zkLend : nostraLending;
    return pools.filter(
      (p) => p.pool.name == this.secondaryToken && p.protocol.name == dapp.name,
    );
  }

  optimizer(
    eligiblePools: PoolInfo[],
    amount: string,
    actions: StrategyAction[],
  ): StrategyAction[] {
    console.log('optimizer', actions.length, this.stepAmountFactors);
    return [
      ...actions,
      {
        pool: eligiblePools[0],
        amount: (
          Number(amount) * this.stepAmountFactors[actions.length]
        ).toFixed(2),
        isDeposit: actions.length == 0 || actions.length == 2,
      },
    ];
  }

  compounder(
    eligiblePools: PoolInfo[],
    amount: string,
    actions: StrategyAction[],
  ): StrategyAction[] {
    const baseApr = actions.reduce(
      (acc, a) => acc + (a.isDeposit ? a.pool.apr : -a.pool.borrow.apr),
      0,
    );
    const compoundingApr = (1 + baseApr / 26) ** 26 - 1;
    console.log('compounder', baseApr, compoundingApr, actions);
    return [
      ...actions,
      {
        pool: { ...eligiblePools[0], apr: compoundingApr - baseApr },
        amount: (
          Number(amount) * this.stepAmountFactors[actions.length]
        ).toFixed(2),
        isDeposit: true,
      },
    ];
  }

  depositMethods = (
    amount: MyNumber,
    address: string,
    provider: ProviderInterface,
  ) => {
    const baseTokenInfo: TokenInfo = TOKENS.find(
      (t) => t.name == this.token,
    ) as TokenInfo; //

    if (!address || address == '0x0') {
      return [
        {
          tokenInfo: baseTokenInfo,
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
    const strategyContract = new Contract(
      DeltaNeutralAbi,
      this.strategyAddress,
      provider,
    );

    // base token
    const call11 = baseTokenContract.populate('approve', [
      strategyContract.address,
      uint256.bnToUint256(amount.toString()),
    ]);
    const call12 = strategyContract.populate('deposit', [
      uint256.bnToUint256(amount.toString()),
      address,
    ]);

    const calls1 = [call11, call12];

    return [
      {
        tokenInfo: baseTokenInfo,
        calls: calls1,
        balanceAtom: getBalanceAtom(baseTokenInfo, atom(true)),
      },
    ];
  };

  withdrawMethods = (
    amount: MyNumber,
    address: string,
    provider: ProviderInterface,
  ) => {
    const mainToken: TokenInfo = TOKENS.find(
      (t) => t.name == this.token,
    ) as TokenInfo;

    if (!address || address == '0x0') {
      return [
        {
          tokenInfo: mainToken,
          calls: [],
          balanceAtom: DUMMY_BAL_ATOM,
        },
      ];
    }

    const strategyContract = new Contract(
      DeltaNeutralAbi,
      this.strategyAddress,
      provider,
    );

    const call = strategyContract.populate('withdraw', [
      uint256.bnToUint256(amount.toString()),
      address,
    ]);

    const calls: Call[] = [call];

    const nftInfo = NFTS.find(
      (nft) =>
        standariseAddress(nft.address) ==
        standariseAddress(this.strategyAddress),
    );
    if (!nftInfo) {
      throw new Error('DeltaMM: NFT not found');
    }
    return [
      {
        tokenInfo: mainToken,
        calls,
        balanceAtom: getBalanceAtom(nftInfo, atom(true)),
      },
    ];
  };
}
