import { redirect } from 'next/navigation';
import React from 'react';

import { db } from '@/db';

interface RefferalPageProps {
  params: {
    referralCode: string;
  };
}

const RefferalPage: React.FC<RefferalPageProps> = async ({ params }) => {
  const user = await db.user.findFirst({
    where: {
      referralCode: params.referralCode,
    },
  });

  if (!user) {
    return <div>There is no user with this referral code</div>;
  }

  redirect(`http://strkfarm.xyz?referrer=${user.address}`);
};

export default RefferalPage;
