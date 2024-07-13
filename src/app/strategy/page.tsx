import { Container } from '@chakra-ui/react';

import Strategy from './components/Strategy';

type Props = {
  params: { name: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ searchParams }: Props) {
  if (searchParams?.name?.includes('STRK')) {
    return {
      title: 'Auto Compounding STRK | STRKFarm',
      description:
        'Strategies are combination of deposit & borrow actions that combine various pools and risk combinations to maximize yield. We currently have one High yield low risk strategy, and adding more as you read this.',
    };
  }

  if (searchParams?.name?.includes('USDC')) {
    return {
      title: 'Auto Compounding USDC | STRKFarm',
      description:
        'Strategies are combination of deposit & borrow actions that combine various pools and risk combinations to maximize yield. We currently have one High yield low risk strategy, and adding more as you read this.',
    };
  }
}

export default function StrategyPage() {
  return (
    <Container
      maxWidth={'1000px'}
      margin={'0 auto'}
      padding="30px 10px"
      fontFamily={'sans-serif'}
    >
      <Strategy />
    </Container>
  );
}
