import { NextResponse } from 'next/server';
import { Contract, RpcProvider, num, uint256 } from 'starknet';
import ERC4626Abi from '@/abi/erc4626.abi.json';
import axios from 'axios';
import { PrismaClient, rebalances } from '@prisma/client';

export const revalidate = 0;

function standariseAddress(address: string | bigint) {
  return num.getHexString(num.getDecimalString(address.toString()));
}

export async function GET(req: Request, context: any) {
  const { params } = context;
  const addr = params.address;

  // standardised address
  let pAddr = addr;
  try {
    pAddr = standariseAddress(addr);
  } catch (e) {
    throw new Error('Invalid address');
  }

  const prisma = new PrismaClient();
  const transactions = await prisma.rebalances.findMany({
    orderBy: {
        block_number: 'desc'
    },
    where: {
        user: pAddr
    }
  })

  console.log(`transactions length: ${transactions.length}`);
  return NextResponse.json({
    transactions,
  });
}
