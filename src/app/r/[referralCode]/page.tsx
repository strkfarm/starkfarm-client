import { redirect } from 'next/navigation';
import React from 'react';

import { db } from '@/db';
import { Text } from '@chakra-ui/react';

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
    return (
      <Text
        fontSize="28px"
        lineHeight="40px"
        my="1rem"
        color="cyan"
        textAlign="center"
      >
        <b>
          There is no user with this referral code. <br /> Please try again with
          a valid referral code.
        </b>
      </Text>
    );
  }

  redirect(`${window.location.origin}?referrer=${user.address}`);
};

export default RefferalPage;
