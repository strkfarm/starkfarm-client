import { NextResponse } from 'next/server';

import { db } from '@/db';

export async function POST(req: Request) {
  const { referrerAddress, refreeAddress } = await req.json();

  const user = await db.user.findFirst({
    where: {
      address: referrerAddress,
    },
  });

  if (!user) {
    return NextResponse.json({
      success: false,
      message: 'Referrer not found',
      user: null,
    });
  }

  // check if refree is already referred by anyone else in the db
  const refree = await db.refree.findFirst({
    where: {
      address: refreeAddress,
    },
  });

  if (refree) {
    return NextResponse.json({
      success: false,
      message: 'Refree is already referred by someone else',
      user: refree,
    });
  }

  // check if referrer is already referred by refree or not in the db
  const refree2 = await db.user.findFirst({
    where: {
      address: refreeAddress,
      refrees: {
        some: {
          address: referrerAddress,
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

  // check if refree is already referred by referrer or not in the db
  const referrer = await db.user.findFirst({
    where: {
      address: referrerAddress,
      refrees: {
        some: {
          address: refreeAddress,
        },
      },
    },
  });

  if (referrer) {
    return NextResponse.json({
      success: false,
      message: 'Refree is already referred by referrer',
      user: referrer,
    });
  }

  const updatedUser = await db.user.update({
    where: {
      address: referrerAddress,
    },
    data: {
      refrees: {
        create: {
          address: refreeAddress,
        },
      },
      refreeCount: user.refreeCount! + 1,
    },
  });

  return NextResponse.json({
    success: true,
    message: 'User updated successfully',
    user: updatedUser,
  });
}
