import { NextResponse } from 'next/server';
import { db } from '../../../../../db';

export async function GET(_req: Request) {
  const users = await db.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!users) {
    throw new Error('No users found');
  }

  return NextResponse.json({
    users,
  });
}
