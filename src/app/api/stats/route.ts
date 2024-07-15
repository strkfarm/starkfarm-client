import { NextResponse } from 'next/server';
import { Contract, RpcProvider, uint256 } from 'starknet';
import ERC20Abi from '@/abi/erc20.abi.json';
import axios from 'axios';
import { strategies } from './api-utils';

export const revalidate = 60;

export async function GET(req: Request) {
  const provider = new RpcProvider({
    nodeUrl: process.env.RPC_URL || '',
  });
  const values = strategies.map(async (strategy) => {
    let retry = 0;
    console.log(strategy, 'strategy');
    while (retry < 3) {
      try {
        const contract = new Contract(ERC20Abi, strategy.token, provider);
        const balanceU256Prom: any = contract.call('balanceOf', [
          strategy.contract,
        ]);
        console.log(balanceU256Prom, 'balanceU256Prom');
        const priceInfoProm = axios.get(
          `https://mainnet-api.ekubo.org/price/${strategy.ekuboPriceKey}`,
        );
        const [balanceU256, priceInfo] = await Promise.all([
          balanceU256Prom,
          priceInfoProm,
        ]);
        console.log(priceInfo, 'priceInfo');
        console.log(balanceU256, 'balanceU256');
        const balance = uint256.uint256ToBN(balanceU256).toString();

        const price = priceInfo.data.price;
        console.log('price', price, balance);
        console.log('balance', balance);
        return (Number(balance) * Number(price)) / 10 ** strategy.decimals;
      } catch (e) {
        console.log(e);
        if (retry < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          retry++;
        }
      }
    }
    throw new Error('Failed to fetch data');
  });

  const result = await Promise.all(values);
  return NextResponse.json({
    tvl: result.reduce((a, b) => a + b, 0),
  });
}
