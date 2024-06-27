import { TOKENS } from '@/constants';

export interface StrategyInfo {
  contract: string;
  token: string;
  decimals: number;
  ekuboPriceKey: string;
}

export const strategies: StrategyInfo[] = [
  {
    contract: TOKENS.find((t) => t.name === 'frmzSTRK')?.token || '',
    token: TOKENS.find((t) => t.name === 'zSTRK')?.token || '',
    decimals: 18,
    ekuboPriceKey: `${TOKENS.find((t) => t.name === 'STRK')?.token}/${TOKENS.find((t) => t.name === 'USDC')?.token}`,
  },
  {
    contract: TOKENS.find((t) => t.name === 'frmzUSDC')?.token || '',
    token: TOKENS.find((t) => t.name === 'zUSDC')?.token || '',
    decimals: 6,
    ekuboPriceKey: `${TOKENS.find((t) => t.name === 'USDC')?.token}/${TOKENS.find((t) => t.name === 'USDC')?.token}`,
  },
];
