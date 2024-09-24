import vesuAbi from '@/abi/vesu.abi.json';
import vesuInterestRateAbi from '@/abi/vesuInterestRate.abi.json';
import { atom } from 'jotai';
import { Contract, RpcProvider } from 'starknet';
import {
  APRSplit,
  PoolInfo,
  PoolMetadata,
  ProtocolAtoms,
  StrkLendingIncentivesAtom,
} from './pools';
import { LendingSpace } from './lending.base';
import { atomWithQuery, AtomWithQueryResult } from 'jotai-tanstack-query';
import { IDapp } from './IDapp.store';
import { getTokenInfoFromName } from '@/utils';

// Initialize the provider
const provider = new RpcProvider({ nodeUrl: process.env.NEXT_PUBLIC_RPC_URL });

// Define the ABIs for the contracts
const VesuAbi = vesuAbi;
const VesuSingleton =
  '0x02545b2e5d519fc230e9cd781046d3a64e092114f07e44771e0d719d148725ef';
const VesuExtensionAddress =
  '0x2334189e831d804d4a11d3f71d4a982ec82614ac12ed2e9ca2f8da4e6374fa';

// Utility function to convert a string to BigInt and then to hex
const toBigIntHex = (id: string): string => {
  const bigIntValue = BigInt(id);
  return `0x${bigIntValue.toString(16)}`;
};

// Function to get Utilization
const getUtilisation = async (poolId: string, tokenAddress: string) => {
  const contract = new Contract(VesuAbi, VesuSingleton, provider);
  const poolidHex = toBigIntHex(poolId);
  const res: any = await contract.call('utilization_unsafe', [
    poolidHex,
    tokenAddress,
  ]);
  return res;
};

// Function to get Asset Info
const getAssetInfo = async (poolId: string, tokenAddress: string) => {
  const contract = new Contract(VesuAbi, VesuSingleton, provider);

  const poolidHex = toBigIntHex(poolId);
  const res: any = await contract.call('asset_config_unsafe', [
    poolidHex,
    tokenAddress,
  ]);
  return res[0];
};

// Function to get Base APY
const getBaseApy = async (poolId: string, tokenAddress: string) => {
  const contract = new Contract(
    vesuInterestRateAbi,
    VesuExtensionAddress,
    provider,
  );

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

interface VesuPool {
  id: string;
  isVesu: boolean;
  tokenA: string;
  poolId: string;
  tokenAddress: string;
  rewardApr: string;
  baseApr: string;
  tvl: string;
}

const poolsData: VesuPool[] = [
  {
    id: 'ETH',
    isVesu: true,
    tokenA: 'ETH',
    poolId:
      '2198503327643286920898110335698706244522220458610657370981979460625005526824',
    tokenAddress: getTokenInfoFromName('ETH').token,
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
    tokenAddress: getTokenInfoFromName('STRK').token,
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
    tokenAddress: getTokenInfoFromName('USDC').token,
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
    tokenAddress: getTokenInfoFromName('USDT').token,
    rewardApr: '',
    baseApr: '',
    tvl: '',
  },
];

// Fetch and update pools data with base APR values
async function fetchAndUpdatePoolsData() {
  for (const pool of poolsData) {
    try {
      const res = await getBaseApy(pool.poolId, pool.tokenAddress);
      pool.baseApr = res.toString();
      console.log(res, pool, 'pool-res');
    } catch (e) {
      console.error('Error fetchAndUpdatePoolsData', e);
      pool.baseApr = '0';
    }
  }
  return poolsData;
}

console.log(poolsData, 'updated-pool-data');

export class Vesu extends IDapp<VesuPool[]> {
  name = 'Vesu';
  link = 'https://www.vesu.xyz/markets';
  logo = 'https://assets.strkfarm.xyz/integrations/vesu/logo.png';
  incentiveDataKey = 'Vesu';

  _computePoolsInfo(data: any) {
    return LendingSpace.computePoolsInfo(
      data,
      this.incentiveDataKey,
      {
        name: this.name,
        link: this.link,
        logo: this.logo,
      },
      this.commonVaultFilter,
    );
  }

  getBaseAPY(p: PoolInfo, data: AtomWithQueryResult<any, Error>) {
    let baseAPY: number | 'Err' = 'Err';
    let splitApr: APRSplit | null = null;
    let metadata: PoolMetadata | null = null;
    if (data.isSuccess) {
      const items: VesuPool[] = data.data;
      const item = items.find((doc) => doc.id === p.pool.name);
      if (item) {
        baseAPY = Number(item.baseApr);
        splitApr = {
          apr: baseAPY,
          title: 'Base APY',
          description: '',
        };
        metadata = {
          borrow: {
            apr: 0,
            borrowFactor: 0,
          },
          lending: {
            collateralFactor: 0,
          },
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

export const vesu = new Vesu();

const VesuAtoms: ProtocolAtoms = {
  baseAPRs: atomWithQuery((get) => ({
    queryKey: ['baseAPRs', vesu.name],
    queryFn: async ({ queryKey }: any): Promise<VesuPool[]> => {
      return fetchAndUpdatePoolsData();
    },
  })),
  pools: atom((get) => {
    const poolsInfo = get(StrkLendingIncentivesAtom);
    const empty: PoolInfo[] = [];

    if (!VesuAtoms.baseAPRs) return empty;

    const baseInfo = get(VesuAtoms.baseAPRs);

    if (poolsInfo.data) {
      const pools = vesu._computePoolsInfo(poolsInfo.data);
      return vesu.addBaseAPYs(pools, baseInfo);
    }
    return empty;
  }),
};

export default VesuAtoms;
