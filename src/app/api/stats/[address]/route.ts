import { NextResponse } from 'next/server';
import { num } from 'starknet';
import { getStrategies } from '@/store/strategies.atoms';

export const revalidate = 0;

function standariseAddress(address: string | bigint) {
  return num.getHexString(num.getDecimalString(address.toString()));
}

export async function GET(req: Request, context: any) {
  const { params } = context;
  const addr = params.address;

  // standardised address
  let pAddr = addr;
  try {
    pAddr = standariseAddress(addr);
  } catch (e) {
    throw new Error('Invalid address');
  }

  const strategies = getStrategies();
  const values = strategies.map(async (strategy) => {
    const balanceInfo = await strategy.getUserTVL(pAddr);
    return {
      id: strategy.id,
      usdValue: balanceInfo.usdValue,
      amount: balanceInfo.amount.toEtherStr(),
    };
  });

  const result = await Promise.all(values);
  const sum = result.reduce((acc, item) => acc + item.usdValue, 0);
  console.log({ pAddr, sum });
  return NextResponse.json({
    holdingsUSD: sum,
    strategyWise: result,
  });
}
