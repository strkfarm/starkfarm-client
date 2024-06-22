import { NextResponse } from 'next/server';
import { Contract, RpcProvider, num, uint256 } from 'starknet';
import ERC4626Abi from '@/abi/erc4626.abi.json';
import axios from 'axios';
import { strategies } from '../api-utils';

export const revalidate = 0;

function standariseAddress(address: string | bigint) {
  return num.getHexString(num.getDecimalString(address.toString()));
}

export async function GET(req: Request, context: any) {
  const { params } = context;
  const addr = params.address;

  // standardised address
  let pAddr = addr;
  try {
    pAddr = standariseAddress(addr);
  } catch (e) {
    throw new Error('Invalid address');
  }

  const provider = new RpcProvider({
    nodeUrl: process.env.RPC_URL || '',
  });
  const values = strategies.map(async (strategy) => {
    const contract = new Contract(ERC4626Abi, strategy.contract, provider);
    const sharesU256: any = await contract.call('balanceOf', [pAddr]);
    const shares = uint256.uint256ToBN(sharesU256).toString();

    const balanceU256Prom: any = contract.call('convert_to_assets', [
      sharesU256,
    ]);
    const priceInfoProm = axios.get(
      `https://mainnet-api.ekubo.org/price/${strategy.ekuboPriceKey}`,
    );
    const [balanceU256, priceInfo] = await Promise.all([
      balanceU256Prom,
      priceInfoProm,
    ]);
    console.log(balanceU256, 'balanceU256');
    const balance = uint256.uint256ToBN(balanceU256).toString();

    const price = priceInfo.data.price;
    console.log('price', price, balance);
    return (Number(balance) * Number(price)) / 10 ** strategy.decimals;
  });

  const result = await Promise.all(values);
  const sum = result.reduce((a, b) => a + b, 0);
  console.log({ pAddr, sum });
  return NextResponse.json({
    holdingsUSD: sum,
  });
}
