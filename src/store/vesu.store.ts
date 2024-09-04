import vesuAbi from '@/abi/vesu.abi.json';
import vesuInterestRateAbi from '@/abi/vesuInterestRate.abi.json';
import CONSTANTS, { TokenName } from '@/constants';
import { atom } from 'jotai';
import { Contract, RpcProvider } from 'starknet';
import { Jediswap } from './jedi.store';
import {
  Category,
  PoolInfo,
  PoolType,
  ProtocolAtoms,
  VesuIncentivesAtom,
} from './pools';

// Initialize the provider
const provider = new RpcProvider({ nodeUrl: process.env.NEXT_PUBLIC_RPC_URL });

// Define the ABIs for the contracts
const VesuAbi = vesuAbi;
const VesuInterestRateAbi = vesuInterestRateAbi;
const ContractAddress =
  '0x02545b2e5d519fc230e9cd781046d3a64e092114f07e44771e0d719d148725ef';
// Utility function to convert a string to BigInt and then to hex
const toBigIntHex = (id: string): string => {
  const bigIntValue = BigInt(id);
  return `0x${bigIntValue.toString(16)}`;
};

// Function to get Utilization
const getUtilisation = async (poolId: string, tokenAddress: string) => {
  const contract = new Contract(VesuAbi, ContractAddress, provider);
  const poolidHex = toBigIntHex(poolId);
  const res: any = await contract.call('utilization_unsafe', [
    poolidHex,
    tokenAddress,
  ]);
  return res;
};

// Function to get Asset Info
const getAssetInfo = async (poolId: string, tokenAddress: string) => {
  const contract = new Contract(VesuAbi, ContractAddress, provider);

  const poolidHex = toBigIntHex(poolId);
  const res: any = await contract.call('asset_config_unsafe', [
    poolidHex,
    tokenAddress,
  ]);
  return res[0];
};

// Function to get Base APY
const getBaseApy = async (poolId: string, tokenAddress: string) => {
  const contract = new Contract(VesuInterestRateAbi, ContractAddress, provider);

  const utilization = await getUtilisation(poolId, tokenAddress);
  const assetInfo = await getAssetInfo(poolId, tokenAddress);

  const interestRate = await contract.call('interest_rate', [
    poolId,
    tokenAddress,
    utilization,
    assetInfo.last_updated,
    assetInfo.last_full_utilization_rate,
  ]);

  const apy =
    (Number(utilization) / 10 ** 18) *
    ((1 + Number(interestRate) / 10 ** 18) ** (360 * 86400) - 1);

  return apy;
};

const poolsData = [
  {
    id: 'ETH',
    isVesu: true,
    tokenA: 'ETH',
    poolId:
      '2198503327643286920898110335698706244522220458610657370981979460625005526824',
    tokenAddress:
      '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
    rewardApr: '',
    baseApr: '',
    tvl: '',
  },
  {
    id: 'STRK',
    isVesu: true,
    tokenA: 'STRK',
    poolId:
      '2198503327643286920898110335698706244522220458610657370981979460625005526824',
    tokenAddress:
      '0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
    rewardApr: '',
    baseApr: '',
    tvl: '',
  },
  {
    id: 'USDC',
    isVesu: true,
    tokenA: 'USDC',
    poolId:
      '2198503327643286920898110335698706244522220458610657370981979460625005526824',
    tokenAddress:
      '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
    rewardApr: '',
    baseApr: '',
    tvl: '',
  },
  {
    id: 'USDT',
    isVesu: true,
    tokenA: 'USDT',
    poolId:
      '2198503327643286920898110335698706244522220458610657370981979460625005526824',
    tokenAddress:
      '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8',
    rewardApr: '',
    baseApr: '',
    tvl: '',
  },
];

// Fetch and update pools data with base APR values
async function fetchAndUpdatePoolsData() {
  for (const pool of poolsData) {
    const res = await getBaseApy(pool.poolId, pool.tokenAddress);
    pool.baseApr = res.toString();
    console.log(res, pool.id, 'pool-res');
  }
}

fetchAndUpdatePoolsData();

console.log(poolsData, 'updated-pool-data');

export class Vesu extends Jediswap {
  name = 'Vesu';
  link = 'https://www.vesu.xyz/markets';
  logo =
    'https://github.com/vesuxyz/assets/blob/main/logo/logo_hi-res_light-mode.png';
  incentiveDataKey = 'isVesu';

  _computePoolsInfo(data: any) {
    try {
      const myData = data;
      console.log(myData, 'API response data');

      const pools: PoolInfo[] = [];

      poolsData.forEach((poolData) => {
        if (poolData.isVesu && myData[poolData.tokenA]) {
          const latestData =
            myData[poolData.tokenA][myData[poolData.tokenA].length - 1];

          const tvl = latestData.supply_usd;
          const rewardApr = latestData.strk_grant_apr_ts;

          poolData.tvl = tvl.toString();
          poolData.rewardApr = rewardApr;
        }
      });

      poolsData.forEach((poolData) => {
        if (poolData.isVesu) {
          const category = Category.Stable;
          const tokens: TokenName[] = [poolData.tokenA] as TokenName[];
          const logo1 = CONSTANTS.LOGOS[tokens[0]];

          const baseApr = parseFloat(poolData.baseApr);
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
            type: PoolType.Lending,
            lending: {
              collateralFactor: 0,
            },
            borrow: {
              borrowFactor: 0,
              apr: 0,
            },
          };
          pools.push(poolInfo);
        }
      });

      console.log(pools);
      return pools;
    } catch (err) {
      console.error('Err computing pools', err);
      throw err;
    }
  }
}

export const vesu = new Vesu();

const VesuAtoms: ProtocolAtoms = {
  pools: atom((get) => {
    const poolsInfo = get(VesuIncentivesAtom);
    const empty: PoolInfo[] = [];
    if (poolsInfo.data) return vesu._computePoolsInfo(poolsInfo.data);
    return empty;
  }),
};

export default VesuAtoms;
