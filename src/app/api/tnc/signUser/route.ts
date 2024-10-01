import { NextResponse } from 'next/server';

import { LATEST_TNC_DOC_VERSION, SIGNING_DATA } from '@/constants';
import { db } from '@/db';
import { standariseAddress } from '@/utils';
import { Account, RpcProvider } from 'starknet';

export async function POST(req: Request) {
  const { address, signature } = await req.json();

  if (!address || !signature) {
    return NextResponse.json({
      success: false,
      message: 'address or signature not found',
      user: null,
    });
  }

  // standardised address
  let parsedAddress = address;
  try {
    parsedAddress = standariseAddress(address);
  } catch (e) {
    throw new Error('Invalid address');
  }

  const parsedSignature = JSON.parse(signature) as string[];
  console.log(address, parsedSignature, 'parsedSignature');

  if (!parsedSignature || parsedSignature.length <= 0) {
    return NextResponse.json({
      success: false,
      message: 'parsing of signature failed',
      user: null,
    });
  }

  const provider = new RpcProvider({
    nodeUrl: process.env.NEXT_PUBLIC_RPC_URL!,
  });

  const myAccount = new Account(provider, address, '');

  let isValid;

  console.log(`Verifying signature for address: ${parsedAddress}`);
  try {
    isValid = await myAccount.verifyMessage(SIGNING_DATA, parsedSignature);
    console.log('isValid', isValid);
  } catch (error) {
    console.log('verification failed:', error);
  }

  if (!isValid) {
    return NextResponse.json({
      success: false,
      message: 'Invalid signature',
      user: null,
    });
  }

  const user = await db.user.findFirst({
    where: {
      address: parsedAddress,
    },
  });

  if (!user) {
    return NextResponse.json({
      success: false,
      message: 'User not found',
      user: null,
    });
  }

  const updatedUser = await db.user.update({
    where: {
      address: parsedAddress,
    },
    data: {
      message: signature,
      isTncSigned: true,
      tncDocVersion: LATEST_TNC_DOC_VERSION,
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Tnc signed successfully',
    user: updatedUser,
  });
}
