import { NextResponse } from 'next/server';
import { db } from '../../../../../db';

export async function POST(req: Request) {
  const { address, message } = await req.json();

  const user = await db.user.create({
    data: {
      address,
      message,
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
