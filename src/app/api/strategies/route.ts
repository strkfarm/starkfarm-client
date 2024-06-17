import { strategiesAtom } from '@/store/strategies.atoms';
import { useAtomValue } from 'jotai';
import { NextResponse } from 'next/server';

export const revalidate = 3600; // 1 hr
export async function GET(req: Request) {
    const strategies = useAtomValue(strategiesAtom);
    console.log(strategies);
  try {
    return NextResponse.json({
      status: true,
      strategies: [],
    });
  } catch (err) {
    console.error('Error /api/strategies', err);
    return NextResponse.json({
        status: false,
        strategies: []
    });
  }
}
