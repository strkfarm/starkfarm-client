import { Container } from '@chakra-ui/react';

import Strategy from './components/Strategy';
import { getStrategies } from '@/store/strategies.atoms';

type Props = {
  params: { name: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ searchParams }: Props) {
  const strategies = getStrategies();
  const strategy = strategies.find((s) => s.id === searchParams?.id);
  if (strategy) {
    return {
      title: `${strategy.name} | STRKFarm`,
      description: strategy.description,
    };
  }

  return {
    title: 'Yield Strategy | STRKFarm',
    description:
      "STRKFarm's yield strategies are designed to maximize your yield farming returns. Stake your assets in our strategies to earn passive income while we take care of the rest.",
  };
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
