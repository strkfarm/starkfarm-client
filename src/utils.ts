import { MenuItemProps, MenuListProps } from '@chakra-ui/react';
import { num } from 'starknet';
import { TOKENS } from './constants';

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
  return `${window.location.origin}/r/${referralCode}`
}