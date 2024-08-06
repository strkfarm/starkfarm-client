import { NextResponse } from 'next/server';
import { getStrategies } from '@/store/strategies.atoms';

export const revalidate = 60;

export async function GET(req: Request) {
  const strategies = getStrategies();
  console.log('strategies', strategies.length);
  const values = strategies.map(async (strategy, index) => {
    let retry = 0;
    while (retry < 3) {
      try {
        const tvlInfo = await strategy.getTVL();
        console.log('tvlInfo', index, tvlInfo);
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
