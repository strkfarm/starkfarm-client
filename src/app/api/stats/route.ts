import { NextResponse } from 'next/server';
import { Contract, RpcProvider, uint256 } from 'starknet';
import ERC20Abi from '@/abi/erc20.abi.json';
import axios from 'axios';
import { getStrategies } from '@/store/strategies.atoms';

export const revalidate = 60;

export async function GET(req: Request) {
  const provider = new RpcProvider({
    nodeUrl: process.env.RPC_URL || '',
  });
  const strategies = getStrategies();
  const values = strategies.map(async (strategy) => {
    let retry = 0;
    while (retry < 3) {
      try {
        const tvlInfo = await strategy.getTVL()
        return tvlInfo.usdValue;
      } catch (e) {
        console.log(e);
        if (retry < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          retry++;
        }
      }
    }
    throw new Error('Failed to fetch data');
  });

  const result = await Promise.all(values);
  return NextResponse.json({
    tvl: result.reduce((a, b) => a + b, 0),
  });
}
