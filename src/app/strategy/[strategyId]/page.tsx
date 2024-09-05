import { Container } from '@chakra-ui/react';

import { getStrategies } from '@/store/strategies.atoms';
import Strategy from './_components/Strategy';

export type StrategyParams = {
  params: { strategyId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: StrategyParams) {
  const strategies = getStrategies();
  const strategy = strategies.find((s) => s.id === params?.strategyId);
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

export default function StrategyPage({ params }: StrategyParams) {
  return (
    <Container maxWidth={'1000px'} margin={'0 auto'} padding="30px 10px">
      <Strategy params={params} />
    </Container>
  );
}
