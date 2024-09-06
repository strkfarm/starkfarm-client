import CONSTANTS, { TokenName } from '@/constants';
import {
  APRSplit,
  Category,
  PoolInfo,
  PoolMetadata,
  PoolType,
  ProtocolAtoms,
  StrkDexIncentivesAtom,
} from './pools';
import { atom } from 'jotai';
import { IDapp } from './IDapp.store';
import { AtomWithQueryResult, atomWithQuery } from 'jotai-tanstack-query';
import { BlockInfo, getBlock } from './utils.atoms';
import { StrategyLiveStatus } from '@/strategies/IStrategy';

interface MyBaseAprDoc {
  id: string;
  apr: number;
}

const PairInfo: any = {
  'USDC/USDT':
    '0x5801bdad32f343035fb242e98d1e9371ae85bc1543962fedea16c59b35bd19b',
  'STRK/ETH':
    '0x2ed66297d146ecd91595c3174da61c1397e8b7fcecf25d423b1ba6717b0ece9',
  'ETH/USDC':
    '0x4d0390b777b424e43839cd1e744799f3de6c176c7e32c1812a41dbd9c19db6a',
  'STRK/USDC':
    '0x5726725e9507c3586cc0516449e2c74d9b201ab2747752bb0251aaa263c9a26',
};

export class Jediswap extends IDapp<string> {
  name = 'Jediswap (v1)';
  link = 'https://app.jediswap.xyz/#/pool';
  logo = 'https://app.jediswap.xyz/favicon/favicon-32x32.png';
  incentiveDataKey = 'Jediswap_v1';
  _computePoolsInfo(data: any) {
    try {
      const myData = data[this.incentiveDataKey];
      if (!myData) return [];
      const pools: PoolInfo[] = [];
      Object.keys(myData)
        .filter(this.commonVaultFilter)
        .forEach((poolName) => {
          const arr = myData[poolName];
          let category = Category.Others;

          let riskFactor = 3;
          if (poolName === 'USDC/USDT') {
            category = Category.Stable;
            riskFactor = 0.5;
          } else if (poolName.includes('STRK')) {
            category = Category.STRK;
          }

          const tokens: TokenName[] = <TokenName[]>poolName.split('/');
          const logo1 = CONSTANTS.LOGOS[tokens[0]];
          const logo2 = CONSTANTS.LOGOS[tokens[1]];
          const poolInfo: PoolInfo = {
            pool: {
              id: this.getPoolId(this.name, poolName),
              name: poolName,
              logos: [logo1, logo2],
            },
            protocol: {
              name: this.name,
              link: this.link,
              logo: this.logo,
            },
            apr: arr[arr.length - 1].apr,
            tvl: arr[arr.length - 1].tvl_usd,
            aprSplits: [
              {
                apr: arr[arr.length - 1].apr,
                title: 'STRK rewards',
                description: 'Starknet DeFi Spring incentives',
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
            additional: {
              riskFactor,
              tags: [StrategyLiveStatus.ACTIVE],
              isAudited: false, // TODO: Update this
            },
          };
          pools.push(poolInfo);
        });
      console.log('processed pools jedi', pools);
      return pools;
    } catch (err) {
      console.error('Err fetching poools [2]', err);
      throw err;
    }
  }

  getBaseAPY(p: PoolInfo, data: AtomWithQueryResult<any, Error>) {
    const aprData: MyBaseAprDoc[] = data.data;
    let baseAPY: number | 'Err' = 'Err';
    let splitApr: APRSplit | null = null;
    const metadata: PoolMetadata | null = null;
    if (data.isSuccess) {
      const pairId = PairInfo[p.pool.name];
      const item = aprData.find((doc) => doc.id === pairId);
      if (item) {
        baseAPY = item.apr;
        splitApr = {
          apr: baseAPY,
          title: 'Base APY',
          description: '',
        };
      }
    }
    return {
      baseAPY,
      splitApr,
      metadata,
    };
  }
}

async function getVolumes(block: number) {
  let supportedPairs = '';
  Object.keys(PairInfo).forEach((pair: any) => {
    supportedPairs += `"${PairInfo[pair]}",`;
  });
  supportedPairs = supportedPairs.slice(0, supportedPairs.length - 1);
  const data = JSON.stringify({
    query: `query pairs {
        pairs(first: 200, where: {idIn: [${supportedPairs}]}, block: {number: ${block}}, orderBy: "tracked_reserve_eth", orderByDirection: "desc") {
          id
          reserveUSD
          trackedReserveETH
          volumeUSD
          untrackedVolumeUSD
          __typename,
        }
      }`,
    variables: {},
  });

  const res = await fetch(CONSTANTS.JEDI.BASE_API, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: data,
  });
  return res.json();
}

export const jedi = new Jediswap();
const JediAtoms: ProtocolAtoms = {
  baseAPRs: atomWithQuery((get) => ({
    queryKey: ['jedi_base_aprs'],
    queryFn: async ({ queryKey }) => {
      console.log('jedi base');
      const nowSeconds = Math.round(new Date().getTime() / 1000) - 300; // giving enough time to have data
      const NowMinus1DSeconds = nowSeconds - 86400;
      const promsies: Promise<BlockInfo>[] = [
        getBlock(nowSeconds),
        getBlock(NowMinus1DSeconds),
      ];
      const [blockInfoNow, blockInfoMinus1D] = await Promise.all(promsies);

      console.log('jedi base', { blockInfoNow, blockInfoMinus1D });
      if (blockInfoNow && blockInfoMinus1D) {
        const blockNow = blockInfoNow.data.blocks[0]?.number;
        const blockMinus1D = blockInfoMinus1D.data.blocks[0]?.number;
        if (blockNow && blockMinus1D) {
          console.log('jedi base', 'blocks', blockNow, blockMinus1D);
          const volumeNow = await getVolumes(blockNow);
          const volumeMinus1D = await getVolumes(blockMinus1D);

          console.log(
            {
              volumeNow,
              volumeMinus1D,
            },
            'jedi base',
            'volumes',
          );

          const aprData: { id: string; apr: number }[] =
            volumeNow.data.pairs.map((pair: any) => {
              // ** Example **
              // id: "0x4d0390b777b424e43839cd1e744799f3de6c176c7e32c1812a41dbd9c19db6a"
              // reserveUSD: "1947021.515426070139800240606"
              // trackedReserveETH: "528.8013957698578160986699995"
              // untrackedVolumeUSD: "158173.0240443795579254700652081547"
              // volumeUSD: "285564373.9797390817264734159690583"

              const prevVolume = volumeMinus1D.data.pairs.find(
                (p: any) => p.id === pair.id,
              );
              if (!prevVolume) {
                console.error('prev vol not found', pair, volumeMinus1D);
                throw new Error('prev vol not found');
              }
              const twnty4hrVol =
                Number(pair.volumeUSD) - Number(prevVolume.volumeUSD);

              return {
                id: pair.id,
                apr: (twnty4hrVol * 365 * 0.003) / Number(pair.reserveUSD),
              };
            });

          return aprData;
        }
      }
      const empty: { id: string; apr: number }[] = [];
      return empty;
    },
  })),
  pools: atom((get) => {
    const poolsInfo = get(StrkDexIncentivesAtom);
    const empty: PoolInfo[] = [];
    // if (!JediAtoms.baseAPRs) return empty;
    // const baseInfo = get(JediAtoms.baseAPRs)
    if (poolsInfo.data) {
      const pools = jedi._computePoolsInfo(poolsInfo.data);
      // return jedi.addBaseAPYs(pools, baseInfo);
      return pools;
    }
    return empty;
  }),
};
export default JediAtoms;
