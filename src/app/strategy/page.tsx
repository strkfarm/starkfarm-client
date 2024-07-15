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
        "Stake your STRK or zkLend's zSTRK token to receive DeFi Spring $STRK rewards every 14 days. The strategy auto-collects your rewards and re-invests them in the zkLend STRK pool, giving you higher return through compounding. You receive frmzSTRK LP token as representation for your stake on STRKFarm. You can withdraw anytime by redeeming your frmzSTRK for zSTRK and see your STRK in zkLend.",
    };
  }

  if (searchParams?.name?.includes('USDC')) {
    return {
      title: 'Auto Compounding USDC | STRKFarm',
      description:
        "Stake your USDC or zkLend's zUSDC token to receive DeFi Spring $STRK rewards every 14 days. The strategy auto-collects your $STRK rewards, swaps them to USDC and re-invests them in the zkLend USDC pool, giving you higher return through compounding. You receive frmzUSDC LP token as representation for your stake on STRKFarm. You can withdraw anytime by redeeming your frmzUSDC for zUSDC and see your STRK in zkLend.",
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
