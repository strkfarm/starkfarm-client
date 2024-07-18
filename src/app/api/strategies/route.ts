import { strategiesAtom } from '@/store/strategies.atoms';
import { getDefaultStore, useAtomValue } from 'jotai';
import { NextResponse } from 'next/server';

export const revalidate = 3600; // 1 hr

const store = getDefaultStore();

export async function GET(req: Request) {
    const strategies = store.get(strategiesAtom);
  try {
    return NextResponse.json({
      status: true,
      strategies: strategies.length,
    });
  } catch (err) {
    console.error('Error /api/strategies', err);
    return NextResponse.json({
        status: false,
        strategies: []
    });
  }
}