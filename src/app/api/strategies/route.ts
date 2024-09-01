import { NextResponse } from 'next/server';
import { atom } from 'jotai';
import ZkLendAtoms from '@/store/zklend.store';
import { PoolInfo } from '@/store/pools';
import NostraLendingAtoms from '@/store/nostralending.store';
import { RpcProvider } from 'starknet';
import { getStrategies } from '@/store/strategies.atoms';
import { MY_STORE } from '@/store';
import MyNumber from '@/utils/MyNumber';
import { NFTInfo, TokenInfo } from '@/strategies/IStrategy';

export const revalidate = 3600; // 1 hr

const allPoolsAtom = atom<PoolInfo[]>((get) => {
  const pools: PoolInfo[] = [];
  const poolAtoms = [ZkLendAtoms, NostraLendingAtoms];
  return poolAtoms.reduce((_pools, p) => _pools.concat(get(p.pools)), pools);
  return [];
});

async function getPools(store: any, retry = 0) {
  const allPools = store.get(allPoolsAtom);
  if (!allPools.length && retry < 10) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return getPools(store, retry + 1);
  }
  if (retry >= 10) {
    throw new Error('Failed to fetch pools');
  }
  return allPools;
}

const provider = new RpcProvider({
  nodeUrl: process.env.RPC_URL || 'https://starknet-mainnet.public.blastapi.io',
});

export async function GET(req: Request) {
  const allPools = await getPools(MY_STORE);
  const strategies = getStrategies();
  strategies.forEach((strategy) => {
    strategy.solve(allPools, '1000');
  });

  try {
    return NextResponse.json({
      status: true,
      strategies: strategies.map((s) => {
        return {
          name: s.name,
          id: s.id,
          apy: s.netYield,
          depositToken: s
            .depositMethods(MyNumber.fromZero(), '', provider)
            .map((t) => t.tokenInfo.token),
          leverage: s.leverage,
          contract: s.holdingTokens.map((t) => ({
            name: t.name,
            address: (<any>t).token
              ? (<TokenInfo>t).token
              : (<NFTInfo>t).address,
          })),
          status: s.liveStatus,
        };
      }),
    });
  } catch (err) {
    console.error('Error /api/strategies', err);
    return NextResponse.json({
      status: false,
      strategies: [],
    });
  }
}
