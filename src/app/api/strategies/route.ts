import { NextResponse } from 'next/server';

export const revalidate = 3600; // 1 hr

export async function GET(req: Request) {
  try {
    return NextResponse.json({
      status: true,
    });
  } catch (err) {
    console.error('Error /api/strategies', err);
    return NextResponse.json({
      status: false,
      strategies: [],
    });
  }
}
