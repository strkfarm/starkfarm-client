import { NextResponse } from 'next/server';

import { db } from '@/db';
import { standariseAddress } from '@/utils';

export async function POST(req: Request) {
  const { referrerAddress, refreeAddress } = await req.json();

  if (!referrerAddress || !refreeAddress) {
    return NextResponse.json({
      success: false,
      message: 'Invalid referrer or refree address',
      user: null,
    });
  }

  // standardised address
  let parsedReferrerAddress = referrerAddress;
  let parsedRefreeAddress = refreeAddress;

  try {
    parsedReferrerAddress = standariseAddress(referrerAddress);
    parsedRefreeAddress = standariseAddress(refreeAddress);
  } catch (e) {
    throw new Error('Invalid address');
  }

  const user = await db.user.findFirst({
    where: {
      address: parsedReferrerAddress,
    },
  });

  const user2 = await db.user.findFirst({
    where: {
      address: parsedRefreeAddress,
    },
  });

  if (!user || !user2) {
    return NextResponse.json({
      success: false,
      message: 'Referrer or Refree not found',
      user: null,
    });
  }

  // check if refree is already referred by anyone else
  const refree = await db.referral.findFirst({
    where: {
      refreeAddress: parsedRefreeAddress,
    },
  });

  if (refree) {
    return NextResponse.json({
      success: false,
      message: 'Refree is already referred by someone else',
      user: refree,
    });
  }

  // check if referrer is already referred by refree
  const refree2 = await db.user.findFirst({
    where: {
      address: parsedRefreeAddress,
      referrals: {
        some: {
          refreeAddress: parsedReferrerAddress,
        },
      },
    },
  });

  if (refree2) {
    return NextResponse.json({
      success: false,
      message: 'Referrer is already referred by refree',
      user: refree2,
    });
  }

  const updatedUser = await db.user.update({
    where: {
      address: parsedReferrerAddress,
    },
    data: {
      referrals: {
        create: {
          refreeAddress: parsedRefreeAddress,
        },
      },
      referralCount: user.referralCount! + 1,
    },
  });

  return NextResponse.json({
    success: true,
    message: 'User updated successfully',
    user: updatedUser,
  });
}
