import React from 'react';

interface RefferalPageProps {
  params: {
    referralCode: string;
  };
}

const RefferalPage: React.FC<RefferalPageProps> = ({ params }) => {
  return <div>{params.referralCode}</div>;
};

export default RefferalPage;
