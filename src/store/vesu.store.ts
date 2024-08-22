import CONSTANTS, { TokenName } from '@/constants';
import { Category, PoolType } from './pools';
import { atom } from 'jotai';
import { PoolInfo, ProtocolAtoms } from './pools';
import { Jediswap } from './jedi.store';

// The Vesu Pool data is hartdcoded here as there is no api and there's a lot of calculations made into finding the apy values for each of thier pool. these values gotten are put into the data array below.

const poolsData = [
  {
    id: 'ETH',
    isVesu: true,
    tokenA: 'ETH',
    baseApr: '0.0000305',
    rewardApr: '0.09',
    tvl: '1000000',
  },
  {
    id: 'STRK',
    isVesu: true,
    tokenA: 'STRK',
    baseApr: '0.0000074',
    rewardApr: '0.13',
    tvl: '2000000',
  },
  {
    id: 'USDC',
    isVesu: true,
    tokenA: 'USDC',
    baseApr: '0.000245',
    rewardApr: '0.10',
    tvl: '2000000',
  },
  {
    id: 'USDT',
    isVesu: true,
    tokenA: 'USDT',
    baseApr: '0.000917',
    rewardApr: '0.10',
    tvl: '2000000',
  },
];

export class Vesu extends Jediswap {
  name = 'Vesu.xyz';
  link = 'https://www.vesu.xyz/markets';
  logo =
    'https://github.com/vesuxyz/assets/blob/main/logo/logo_hi-res_light-mode.png';
  incentiveDataKey = 'isVesu';

  _computePoolsInfo() {
    try {
      const pools: PoolInfo[] = [];
      poolsData
        .filter((poolData) => poolData.isVesu)
        .forEach((poolData) => {
          const category = Category.Stable;
          const tokens: TokenName[] = [poolData.tokenA] as TokenName[];
          const logo1 = CONSTANTS.LOGOS[tokens[0]];
          const baseApr =
            poolData.baseApr === '0' ? 0.0 : parseFloat(poolData.baseApr);
          const rewardApr = parseFloat(poolData.rewardApr);
          const poolInfo: PoolInfo = {
            pool: {
              name: poolData.id,
              logos: [logo1],
            },
            protocol: {
              name: this.name,
              link: this.link,
              logo: this.logo,
            },
            apr: baseApr + rewardApr,
            tvl: Number(poolData.tvl),
            aprSplits: [
              {
                apr: baseApr,
                title: 'Base APR',
                description: '',
              },
              {
                apr: rewardApr,
                title: 'Reward APR',
                description: '',
              },
            ],
            category,
            type: PoolType.DEXV2,
            lending: {
              collateralFactor: 0,
            },
            borrow: {
              borrowFactor: 0,
              apr: 0,
            },
          };
          pools.push(poolInfo);
        });
      return pools;
    } catch (err) {
      console.error('Err computing pools', err);
      throw err;
    }
  }
}

export const vesu = new Vesu();

const VesuAtoms: ProtocolAtoms = {
  pools: atom(() => {
    return vesu._computePoolsInfo();
  }),
};

export default VesuAtoms;
