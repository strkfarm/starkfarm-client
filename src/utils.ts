import { MenuItemProps, MenuListProps } from '@chakra-ui/react';
import { num } from 'starknet';
import { TOKENS } from './constants';
import toast from 'react-hot-toast';
import { TokenInfo } from './strategies/IStrategy';
import axios from 'axios';

export function getUniqueStrings(arr: Array<string>) {
  const _arr: string[] = [];
  arr.forEach((item) => {
    if (!_arr.includes(item)) _arr.push(item);
  });
  return _arr;
}

export function getUnique<T>(arr: Array<T>, uniqueField: string) {
  const _arr: T[] = [];
  const map: { [key: string]: boolean } = {};
  arr.forEach((item: any) => {
    if (!map[item[uniqueField]]) {
      _arr.push(item);
      map[item[uniqueField]] = true;
    }
  });
  return _arr;
}

export function getUniqueById<T>(arr: Array<T>) {
  return getUnique(arr, 'id');
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function shortAddress(_address: string) {
  const x = num.toHex(num.getDecimalString(_address));
  return truncate(x, 4, 4);
}

export function truncate(str: string, startChars: number, endChars: number) {
  if (str.length <= startChars + endChars) {
    return str;
  }

  return `${str.slice(0, startChars)}...${str.slice(str.length - endChars, str.length)}`;
}

export function standariseAddress(address: string | bigint) {
  let _a = address;
  if (!address) {
    _a = '0';
  }
  const a = num.getHexString(num.getDecimalString(_a.toString()));
  return a;
}

export const MyMenuListProps: MenuListProps = {
  bg: 'highlight',
  color: 'white',
  borderColor: 'bg',
  padding: 0,
};

export const MyMenuItemProps: MenuItemProps = {
  bg: 'highlight',
  _hover: {
    bg: 'bg',
  },
};

export function getTokenInfoFromAddr(tokenAddr: string) {
  const info = TOKENS.find(
    (t) => standariseAddress(t.token) === standariseAddress(tokenAddr),
  );
  if (!info) {
    throw new Error('Token not found');
  }
  return info;
}

export function getTokenInfoFromName(tokenName: string) {
  const info = TOKENS.find(
    (t) => t.name.toLowerCase() === tokenName.toLowerCase(),
  );
  if (!info) {
    throw new Error('Token not found');
  }
  return info;
}

export function generateReferralCode() {
  const code = Math.random().toString(36).slice(2, 8);
  return code;
}

export function getReferralUrl(referralCode: string) {
  if (window.location.origin.includes('app.strkfarm.xyz')) {
    return `https://strkfarm.xyz/r/${referralCode}`;
  }
  return `${window.location.origin}/r/${referralCode}`;
}

export function getDisplayCurrencyAmount(
  amount: string | number,
  decimals: number,
) {
  return Number(Number(amount).toFixed(decimals)).toLocaleString();
}

export function copyReferralLink(refCode: string) {
  navigator.clipboard.writeText(getReferralUrl(refCode));

  toast.success('Referral link copied to clipboard', {
    position: 'bottom-right',
  });
}

export async function getPrice(tokenInfo: TokenInfo) {
  try {
    return await getPriceFromMyAPI(tokenInfo);
  } catch (e) {
    console.error('getPriceFromMyAPI error', e);
  }
  console.log('getPrice coinbase', tokenInfo.name);
  const priceInfo = await axios.get(
    `https://api.coinbase.com/v2/prices/${tokenInfo.name}-USDT/spot`,
  );
  const price = Number(priceInfo.data.data.amount);
  return price;
}

export async function getPriceFromMyAPI(tokenInfo: TokenInfo) {
  console.log('getPrice from redis', tokenInfo.name);

  const endpoint =
    typeof window === 'undefined'
      ? process.env.HOSTNAME
      : window.location.origin;
  const priceInfo = await axios.get(`${endpoint}/api/price/${tokenInfo.name}`);
  const now = new Date();
  const priceTime = new Date(priceInfo.data.timestamp);
  if (now.getTime() - priceTime.getTime() > 900000) {
    // 15 mins
    throw new Error('Price is stale');
  }
  const price = Number(priceInfo.data.price);
  return price;
}
