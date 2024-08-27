import { NextResponse } from 'next/server';

import { db } from '@/db';
import { standariseAddress } from '@/utils';

export async function POST(req: Request) {
  const { address, referralCode } = await req.json();

  if (!address) {
    return NextResponse.json({
      success: false,
      message: 'No address found',
    });
  }

  if (!referralCode) {
    return NextResponse.json({
      success: false,
      message: 'No referral code found',
    });
  }

  // standardised address
  let parsedAddress = address;
  try {
    parsedAddress = standariseAddress(address);
  } catch (e) {
    throw new Error('Invalid address');
  }

  const user = await db.user.create({
    data: {
      address: parsedAddress,
      referralCode,
    },
  });

  if (!user) {
    return NextResponse.json({
      success: false,
      message: 'Error creating user',
      user: null,
    });
  }

  return NextResponse.json({
    success: true,
    message: 'User created successfully',
    user,
  });
}
