import { db } from '@/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request, context: any) {
  const { params } = context;

  const user = await db.user.findFirst({
    where: {
      referralCode: params.referralCode,
    },
  });

  const origin = req.headers.get('origin');
  const host = req.headers.get('host'); // This gives y
  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  console.log({ origin, host, protocol });

  if (!user) {
    return NextResponse.redirect(`${protocol}://${host}/`);
  }

  return NextResponse.redirect(
    `${protocol}://${host}/?referrer=${user.address}`,
  );
}
