import { NextResponse } from 'next/server';
import { atom } from 'jotai';
import ZkLendAtoms, { zkLend } from '@/store/zklend.store';
import { PoolInfo, PoolType } from '@/store/pools';
import NostraLendingAtoms, { nostraLending } from '@/store/nostralending.store';
import { RpcProvider } from 'starknet';
import { getLiveStatusNumber, getStrategies } from '@/store/strategies.atoms';
import { MY_STORE } from '@/store';
import MyNumber from '@/utils/MyNumber';
import { IStrategy, NFTInfo, TokenInfo } from '@/strategies/IStrategy';
import { STRKFarmStrategyAPIResult } from '@/store/strkfarm.atoms';

export const revalidate = 3600; // 1 hr

const allPoolsAtom = atom<PoolInfo[]>((get) => {
  const pools: PoolInfo[] = [];
  const poolAtoms = [ZkLendAtoms, NostraLendingAtoms];
  return poolAtoms.reduce((_pools, p) => _pools.concat(get(p.pools)), pools);
});

async function getPools(store: any, retry = 0) {
  const allPools: PoolInfo[] | undefined = store.get(allPoolsAtom);

  const minProtocolsRequired = [zkLend.name, nostraLending.name];
  const hasRequiredPools = minProtocolsRequired.every((p) => {
    if (!allPools) return false;
    return allPools.some(
      (pool) => pool.protocol.name === p && pool.type == PoolType.Lending,
    );
  });
  const MAX_RETRIES = 120;
  if (retry >= MAX_RETRIES) {
    throw new Error('Failed to fetch pools');
  } else if (!allPools || !hasRequiredPools) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return getPools(store, retry + 1);
  }
  return allPools;
}

const provider = new RpcProvider({
  nodeUrl: process.env.RPC_URL || 'https://starknet-mainnet.public.blastapi.io',
});

async function getStrategyInfo(
  strategy: IStrategy,
): Promise<STRKFarmStrategyAPIResult> {
  const tvl = await strategy.getTVL();

  return {
    name: strategy.name,
    id: strategy.id,
    apy: strategy.netYield,
    depositToken: strategy
      .depositMethods({
        amount: MyNumber.fromZero(),
        address: '',
        provider,
        isMax: false,
      })
      .map((t) => t.tokenInfo.token),
    leverage: strategy.leverage,
    contract: strategy.holdingTokens.map((t) => ({
      name: t.name,
      address: (<any>t).token ? (<TokenInfo>t).token : (<NFTInfo>t).address,
    })),
    tvlUsd: tvl.usdValue || 0,
    status: {
      number: getLiveStatusNumber(strategy.liveStatus),
      value: strategy.liveStatus,
    },
    riskFactor: strategy.riskFactor,
    logo: strategy.holdingTokens[0].logo,
  };
}

export async function GET(req: Request) {
  const allPools = await getPools(MY_STORE);
  const strategies = getStrategies();

  strategies.forEach((strategy) => {
    try {
      strategy.solve(allPools, '1000');
    } catch (err) {
      console.error('Error solving strategy', strategy.name, err);
    }
  });

  const stratsDataProms: any[] = [];
  for (let i = 0; i < strategies.length; i++) {
    stratsDataProms.push(getStrategyInfo(strategies[i]));
  }

  const stratsData = await Promise.all(stratsDataProms);

  try {
    return NextResponse.json({
      status: true,
      strategies: stratsData,
    });
  } catch (err) {
    console.error('Error /api/strategies', err);
    return NextResponse.json({
      status: false,
      strategies: [],
    });
  }
}
