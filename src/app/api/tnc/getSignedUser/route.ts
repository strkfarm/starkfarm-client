import { NextResponse } from 'next/server';
import { db } from '../../../../../db';

export async function POST(req: Request) {
  const { address } = await req.json();

  const user = await db.user.findFirst({
    where: {
      address,
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
