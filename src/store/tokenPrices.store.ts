import { atomWithQuery } from 'jotai-tanstack-query';
import CONSTANTS, { TOKENS, TokenName } from '@/constants';
import { TokenInfo } from '@/strategies/IStrategy';

interface TokenPrice {
  timestamp: string;
  price: string;
}

type IndexedTokenPrices = Record<string, TokenPrice>;

const fetchTokenPrices = async (): Promise<IndexedTokenPrices> => {
  const tokensMetadata: Record<string, TokenInfo> = Object.fromEntries(
    TOKENS.map((token) => [token.name, token]),
  );

  const PRICE_PAIRS: string[] = ['STRK/USDC', 'ETH/USDC', 'USDC/USDC', 'USDT/USDC'];

  const responses = await Promise.all(
    PRICE_PAIRS.map(async (pair) => {
      const [token0Name, token1Name] = pair.split('/');
      const token0 = tokensMetadata[token0Name];
      const token1 = tokensMetadata[token1Name];

      const response = await fetch(
        `${CONSTANTS.EKUBO.BASE_PRICE_API}/${token0.token}/${token1.token}`,
      );
      const data = await response.json();

      return [token0Name, data];
    }),
  );

  return Object.fromEntries(responses);
};

export const tokenPricesAtom = atomWithQuery(() => ({
  queryKey: ['token_prices'],
  queryFn: fetchTokenPrices,
}));