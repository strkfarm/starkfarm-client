import ERC4626Abi from '@/abi/erc4626.abi.json';
import { NFTInfo, TokenInfo } from '@/strategies/IStrategy';
import MyNumber from '@/utils/MyNumber';
import { NFTS } from '@/constants';
import { Contract, RpcProvider, num, uint256 } from 'starknet';
import { atomWithQuery } from 'jotai-tanstack-query';
import { addressAtom } from '@/store/claims.atoms';
import ERC20Abi from '@/abi/erc20.abi.json';
import DeltaNeutralAbi from '@/abi/deltraNeutral.abi.json';
import { Atom } from 'jotai';
import { getTokenInfoFromAddr, getTokenInfoFromName, standariseAddress } from '@/utils';

export interface BalanceResult {
  amount: MyNumber;
  tokenInfo: TokenInfo | NFTInfo | undefined;
}

function returnEmptyBal(): BalanceResult {
  return {
    amount: MyNumber.fromZero(),
    tokenInfo: undefined,
  };
}

async function getERC20Balance(
  token: TokenInfo | undefined,
  address: string | undefined,
) {
  if (!token) return returnEmptyBal();
  if (!address) return returnEmptyBal();

  const provider = new RpcProvider({
    nodeUrl: process.env.NEXT_PUBLIC_RPC_URL,
  });
  const erc20Contract = new Contract(ERC20Abi, token.token, provider);
  const balance = await erc20Contract.call('balanceOf', [address]);
  console.log('erc20 balData', token.token, balance.toString());
  return {
    amount: new MyNumber(balance.toString(), token.decimals),
    tokenInfo: token,
  };
}

async function getERC4626Balance(
  token: TokenInfo | undefined,
  address: string | undefined,
) {
  console.log('balData isERC4626', token?.token);
  if (!token) return returnEmptyBal();
  if (!address) return returnEmptyBal();

  const bal = await getERC20Balance(token, address);
  const provider = new RpcProvider({
    nodeUrl: process.env.NEXT_PUBLIC_RPC_URL,
  });
  const erc4626Contract = new Contract(ERC4626Abi, token.token, provider);
  const balance = await erc4626Contract.call('convert_to_assets', [
    uint256.bnToUint256(bal.amount.toString()),
  ]);

  const asset = await erc4626Contract.call('asset', []);
  console.log('erc4626 balData', token.token, balance, standariseAddress(asset as string));
  const assetInfo = getTokenInfoFromAddr(standariseAddress(asset as string));
  if (!assetInfo) {
    throw new Error('ERC4626: Asset not found');
  }
  return {
    amount: new MyNumber(balance.toString(), token.decimals),
    tokenInfo: assetInfo,
  };
}

async function getERC721PositionValue(
  token: NFTInfo | undefined,
  address: string | undefined,
) {
  if (!token) return returnEmptyBal();
  if (!address) return returnEmptyBal();

  const provider = new RpcProvider({
    nodeUrl: process.env.NEXT_PUBLIC_RPC_URL,
  });
  const erc721Contract = new Contract(DeltaNeutralAbi, token.address, provider);
  const tokenId = num.getDecimalString(address);
  const result: any = await erc721Contract.call('describe_position', [tokenId]);
  console.log('erc721 position balData', token.address, result[1]);
  const tokenInfo = getTokenInfoFromName(token.config.mainTokenName);
  return {
    amount: new MyNumber(
      uint256.uint256ToBN(result[1].estimated_size).toString(),
      tokenInfo.decimals,
    ),
    tokenInfo,
  };
}

export function getERC20BalanceAtom(token: TokenInfo | undefined) {
  return atomWithQuery((get) => {
    return {
      queryKey: ['getERC20Balance', token?.token],
      queryFn: async ({ queryKey }: any): Promise<BalanceResult> => {
        return getERC20Balance(token, get(addressAtom));
      },
      refetchInterval: 5000,
    };
  });
}

function getERC4626BalanceAtom(token: TokenInfo | undefined) {
  return atomWithQuery((get) => {
    return {
      queryKey: ['getERC4626Balance', token?.token],
      queryFn: async ({ queryKey }: any): Promise<BalanceResult> => {
        return getERC4626Balance(token, get(addressAtom));
      },
      refetchInterval: 5000,
    };
  });
}

function getERC721PositionValueAtom(token: NFTInfo | undefined) {
  return atomWithQuery((get) => {
    return {
      queryKey: ['getERC721PositionValue', token?.address],
      queryFn: async ({ queryKey }: any): Promise<BalanceResult> => {
        return getERC721PositionValue(token, get(addressAtom));
      },
      refetchInterval: 5000,
    };
  });
}

export function getBalanceAtom(
  token: TokenInfo | NFTInfo | undefined,
  enabledAtom: Atom<boolean>,
) {
  if (token) {
    console.log('token getBalanceAtom', token);
    if (Object.prototype.hasOwnProperty.call(token, 'isERC4626')) {
      const _token = <TokenInfo>token;
      console.log('token getBalanceAtom isERC4626', _token.isERC4626)
      if (_token.isERC4626) return getERC4626BalanceAtom(_token);
    } else {
      const _token = <NFTInfo>token;
      const isNFT = NFTS.find((nft) => nft.address === _token.address);
      if (isNFT) return getERC721PositionValueAtom(_token);
    }
  }

  // fallback option for now. if token is undefined, this will return 0 anyways
  return getERC20BalanceAtom(<TokenInfo>token);
}

export const DUMMY_BAL_ATOM = atomWithQuery((get) => {
  return {
    queryKey: ['DUMMY_BAL_ATOM'],
    queryFn: async ({ queryKey }: any): Promise<BalanceResult> => {
      return returnEmptyBal();
    },
    refetchInterval: 100000000,
  };
});
