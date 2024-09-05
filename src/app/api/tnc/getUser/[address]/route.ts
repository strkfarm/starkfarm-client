import { NextResponse } from 'next/server';

import { db } from '@/db';
import { standariseAddress } from '@/utils';

export async function GET(_req: Request, context: any) {
  const { params } = context;
  const address = params.address;

  if (!address) {
    return NextResponse.json({
      success: false,
      message: 'No address found',
    });
  }

  // standardised address
  const parsedAddress = standariseAddress(address);

  const user = await db.user.findFirst({
    where: {
      address: parsedAddress,
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
