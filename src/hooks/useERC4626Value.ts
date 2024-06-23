import ERC4626Abi from '@/abi/erc4626.abi.json';
import { TokenInfo } from '@/strategies/IStrategy';
import MyNumber from '@/utils/MyNumber';
import { useAccount, useContractRead } from '@starknet-react/core';
import { useEffect, useMemo } from 'react';
import { useERC20Balance } from './useERC20Balance';
import CONSTANTS, { NFTS, TOKENS } from '@/constants';
import { standariseAddress } from '@/utils';
import { BlockTag, Contract, RpcProvider, num, uint256 } from 'starknet';
import { atomWithQuery } from 'jotai-tanstack-query';
import { addressAtom } from '@/store/claims.atoms';
import ERC20Abi from '@/abi/erc20.abi.json';
import DeltaNeutralAbi from '@/abi/deltraNeutral.abi.json';

export function useERC4626Value(token: TokenInfo | undefined) {
  const { address } = useAccount();
  const {
    balance,
    isLoading: isLoadingBal,
    isError: isErrorBal,
  } = useERC20Balance(token);

  const {
    data: underlyingBal,
    isError: isErrorConvert,
    isLoading: isLoadingConvert,
    error: errorBal,
  } = useContractRead({
    functionName: 'convert_to_assets',
    args: [uint256.bnToUint256(balance.toString())],
    abi: ERC4626Abi,
    address: token?.token || '0x0',
    watch: true,
    blockIdentifier: BlockTag.pending,
  });

  const {
    data: underlyingAsset,
    isError: isErrorAsset,
    isLoading: isLoadingAsset,
    error: errorAsset,
  } = useContractRead({
    functionName: 'asset',
    args: [],
    abi: ERC4626Abi,
    address: token?.token || '0x0',
    watch: false,
  });

  const underlyingTokenInfo = useMemo(() => {
    if (!underlyingAsset) return undefined;
    return TOKENS.find(
      (t) =>
        standariseAddress(t.token) ===
        standariseAddress(<bigint>underlyingAsset),
    );
  }, [underlyingAsset]);

  const convertedBal = useMemo(() => {
    console.log('4626balance', {
      address,
      balance: balance.toString(),
      underlyingBal,
      underlyingAsset,
      isLoadingBal,
      isLoadingAsset,
      isLoadingConvert,
      isErrorAsset,
      isErrorBal,
      isErrorConvert,
      underlyingTokenInfo,
      errorBal,
      errorAsset,
    });
    if (!address || !token)
      return {
        balance: MyNumber.fromZero(),
        isLoading: false,
        isError: false,
      };
    let convertedBal = MyNumber.fromZero();
    if (underlyingTokenInfo && underlyingBal) {
      convertedBal = new MyNumber(underlyingBal.toString(), token.decimals);
    }
    return {
      balance: convertedBal,
      isLoading: isLoadingAsset || isLoadingBal || isLoadingConvert,
      isError: isErrorAsset || isErrorBal || isErrorConvert,
    };
  }, [
    address,
    underlyingBal,
    underlyingAsset,
    isLoadingBal,
    isLoadingAsset,
    isLoadingConvert,
    isErrorAsset,
    isErrorBal,
    isErrorConvert,
  ]);

  useEffect(() => {
    console.log('4626balance2', {
      finalBal: convertedBal.balance.toEtherStr(),
    });
  }, [convertedBal]);
  return {
    ...convertedBal,
    underlyingTokenInfo,
  };
}