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
  return Number(Number(amount).toFixed(decimals)).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
  });
}

// returns time to endtime in days, hours, minutes
export function formatTimediff(endTime: Date) {
  const now = new Date();
  if (now.getTime() >= endTime.getTime()) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      isZero: true,
    };
  }

  // else return number of days, months, weeks, hours, minutrs, seconds to endtime
  const diff = endTime.getTime() - now.getTime();
  // get days floor
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  // after accounting days, get remaining hours
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  // after accounting days and hours, get remaining minutes
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return {
    days,
    hours,
    minutes,
    isZero: false,
  };
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
    console.warn('getPriceFromMyAPI error', e);
  }
  console.log('getPrice coinbase', tokenInfo.name);
  const priceInfo = await axios.get(
    `https://api.coinbase.com/v2/prices/${tokenInfo.name}-USDT/spot`,
  );
  const price = Number(priceInfo.data.data.amount);
  return price;
}

export function getEndpoint() {
  return (
    (typeof window === 'undefined'
      ? process.env.HOSTNAME
      : window.location.origin) || 'https://app.strkfarm.xyz'
  );
}

export async function getPriceFromMyAPI(tokenInfo: TokenInfo) {
  console.log('getPrice from redis', tokenInfo.name);

  const endpoint = getEndpoint();
  if (endpoint.includes('localhost')) {
    throw new Error('getEndpoint: skip redis');
  }
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

export function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (hours < 1) return `${minutes}min ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  if (months < 3) return `${months}mon ago`;

  // If more than 3 months, return in DD MMM, YY format
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  });
}
