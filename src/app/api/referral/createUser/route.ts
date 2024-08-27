import { NextResponse } from 'next/server';

import { db } from '@/db';
import { standariseAddress } from '@/utils';

function isSixDigitAlphanumeric(str: string) {
  const regex = /^[a-zA-Z0-9]{6}$/;
  return regex.test(str);
}

export async function POST(req: Request) {
  const { address, myReferralCode, referrerAddress } = await req.json();

  // todo: Ask user to sign with the referrer address as input and send the signed msg
  // verify the signature is signed by address and contains the referrer address

  if (!address) {
    return NextResponse.json({
      success: false,
      message: 'No address found',
    });
  }

  // referral value check is important bcz, an attacker can send a very big or small code
  // can break the UI
  if (!myReferralCode || !isSixDigitAlphanumeric(myReferralCode)) {
    return NextResponse.json({
      success: false,
      message: 'Not a valid referral code',
    });
  }

  // standardised address
  const parsedAddress = standariseAddress(address);

  const newUserData = {
    address: parsedAddress,
    referralCode: myReferralCode,
  };
  const result = await db.$transaction(
    referrerAddress
      ? [
          // create new user
          db.user.create({
            data: newUserData,
          }),

          // since referrer is present, update referrer's referral count and add refree
          db.user.update({
            where: {
              address: standariseAddress(referrerAddress),
            },
            data: {
              referrals: {
                create: {
                  refreeAddress: parsedAddress,
                },
              },
              referralCount: { increment: 1 },
            },
          }),
        ]
      : [
          db.user.create({
            data: newUserData,
          }),
        ],
  );

  console.info('newUser', result[0]);
  console.info('referralUpdate', result[1], referrerAddress);

  const newUser = result[0];
  if (!newUser) {
    return NextResponse.json({
      success: false,
      message: 'Error creating user',
      user: null,
    });
  }

  return NextResponse.json({
    success: true,
    message: 'User created successfully',
    user: newUser,
  });
}
