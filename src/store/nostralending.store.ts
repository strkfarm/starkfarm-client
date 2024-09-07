import CONSTANTS, { TokenName } from '@/constants';
import {
  APRSplit,
  PoolInfo,
  PoolMetadata,
  ProtocolAtoms2,
  StrkLendingIncentivesAtom,
} from './pools';
import { atom } from 'jotai';
import { AtomWithQueryResult } from 'jotai-tanstack-query';
import { LendingSpace } from './lending.base';
import { IDapp } from './IDapp.store';
import { customAtomWithFetch } from '@/utils/customAtomWithFetch';

interface MyBaseAprDoc {
  _id: string;
  id: string;
  asset: TokenName;
  block: number;
  borrowingApy: string;
  // borrowingIndex: string,
  lendingApy: string;
  // "lendingIndex": "1022796136817729881",
  timestamp: number;
}

interface NostraPoolFactor {
  asset: string;
  dToken: string;
  borrowFactor: number;
  collateralFactor: number;
}

// ! to remove hard coding later
const PoolAddresses: { [token: string]: NostraPoolFactor } = {
  USDC: {
    asset: '0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
    dToken:
      '0x024e9b0d6bc79e111e6872bb1ada2a874c25712cf08dfc5bcf0de008a7cca55f',
    borrowFactor: 0.95,
    collateralFactor: 0.8,
  },
  STRK: {
    asset: '0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
    dToken:
      '0x001258eae3eae5002125bebf062d611a772e8aea3a1879b64a19f363ebd00947',
    borrowFactor: 0.8,
    collateralFactor: 0.6,
  },
  ETH: {
    asset: '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
    dToken:
      '0x00ba3037d968790ac486f70acaa9a1cab10cf5843bb85c986624b4d0e5a82e74',
    borrowFactor: 0.9,
    collateralFactor: 0.8,
  },
  USDT: {
    asset: '0x68f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8',
    dToken:
      '0x024e9b0d6bc79e111e6872bb1ada2a874c25712cf08dfc5bcf0de008a7cca55f',
    borrowFactor: 0.95,
    collateralFactor: 0.8,
  },
};

export class NostraLending extends IDapp<LendingSpace.MyBaseAprDoc[]> {
  name = 'Nostra';
  link = 'https://app.nostra.finance/';
  logo =
    'https://static-assets-8zct.onrender.com/integrations/nostra/logo_dark.jpg';

  incentiveDataKey = 'Nostra';

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
      const items: {
        documents: MyBaseAprDoc[];
      } = data.data;
      const item = items.documents.find((doc) => doc.asset === p.pool.name);
      if (item) {
        baseAPY = Number(item.lendingApy) / 10 ** 18;
        splitApr = {
          apr: baseAPY,
          title: 'Base APY',
          description: '',
        };
        metadata = {
          borrow: {
            apr: Number(item.borrowingApy) / 10 ** 18,
            borrowFactor: PoolAddresses[p.pool.name].borrowFactor,
          },
          lending: {
            collateralFactor: PoolAddresses[p.pool.name].collateralFactor,
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

export const nostraLending = new NostraLending();
const NostraLendingAtoms: ProtocolAtoms2 = {
  baseAPRs: customAtomWithFetch({
    queryKey: 'nostra_lending_base_aprs',
    url: CONSTANTS.NOSTRA.LENDING_GRAPH_URL,
    fetchOptions: {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dataSource: 'nostra-production',
        database: 'prod-a-nostra-db',
        collection: 'apyStats',
        filter: { timestamp: { $gte: 1697500800 } },
        sort: { timestamp: -1 },
      }),
    },
  }),
  pools: atom((get) => {
    const poolsInfo = get(StrkLendingIncentivesAtom);
    const empty: PoolInfo[] = [];
    if (!NostraLendingAtoms.baseAPRs) return empty;

    const baseInfo = get(NostraLendingAtoms.baseAPRs);
    if (poolsInfo.data) {
      const pools = nostraLending._computePoolsInfo(poolsInfo.data);
      return nostraLending.addBaseAPYs(pools, baseInfo);
    }
    return empty;
  }),
};
export default NostraLendingAtoms;
