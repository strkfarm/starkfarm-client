import { NextPage } from 'next';
import { redirect } from 'next/navigation';

interface StrategyPage {
  searchParams?: { [key: string]: string | string[] | undefined };
}

const StrategyPage: NextPage<StrategyPage> = ({ searchParams }) => {
  if (searchParams?.id === 'strk_sensei') {
    redirect('/strategy/strk_sensei');
  } else if (searchParams?.id === 'usdc_sensei') {
    redirect('/strategy/usdc_sensei');
  } else if (searchParams?.id === 'eth_sensei') {
    redirect('/strategy/eth_sensei');
  } else if (searchParams?.id === 'auto_token_strk') {
    redirect('/strategy/auto_token_strk');
  } else if (searchParams?.id === 'auto_token_usdc') {
    redirect('/strategy/auto_token_usdc');
  }

  return <div>Page not found</div>;
};

export default StrategyPage;
