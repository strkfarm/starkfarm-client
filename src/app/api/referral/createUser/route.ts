import { db } from '@/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { address, referralCode } = await req.json();

  const user = await db.user.create({
    data: {
      address,
      referralCode,
    },
  });

  if (!user) {
    return NextResponse.json({
      success: false,
      user: null,
    });
  }

  return NextResponse.json({
    success: true,
    user,
  });
}
