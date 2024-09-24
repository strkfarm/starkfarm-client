import { NFTInfo, TokenInfo } from './strategies/IStrategy';
import MyNumber from './utils/MyNumber';

const LOGOS = {
  USDT: '/zklend/icons/tokens/usdt.svg?w=20',
  USDC: '/zklend/icons/tokens/usdc.svg?w=20',
  WBTC: '/zklend/icons/tokens/wbtc.svg?w=20',
  ETH: '/zklend/icons/tokens/eth.svg?w=20',
  STRK: '/zklend/icons/tokens/strk.svg?w=20',
  DAI: '/zklend/icons/tokens/dai.svg?w=20',
};

export type TokenName = 'USDT' | 'USDC' | 'ETH' | 'STRK' | 'WBTC' | 'DAI';

const CONSTANTS = {
  DEX_INCENTIVE_URL:
    'https://kx58j6x5me.execute-api.us-east-1.amazonaws.com/starknet/fetchFile?file=strk_grant.json',
  NOSTRA_DEGEN_INCENTIVE_URL: 'https://api.nostra.finance/query/pool_aprs',
  CARMINE_INCENTIVES_URL: '/carmine/api/v1/mainnet/defispring',
  CARMINE_URL: '/carmine/api/v2/mainnet',
  LENDING_INCENTIVES_URL:
    'https://kx58j6x5me.execute-api.us-east-1.amazonaws.com/starknet/fetchFile?file=prod-api/lending/lending_strk_grant.json',
  LOGOS,
  COMMUNITY_TG: 'https://t.me/+HQ_eHaXmF-1lZDc1',
  AUDIT_REPORT:
    'https://static-assets-8zct.onrender.com/strkfarm/audit_report.pdf',
  NOSTRA: {
    LENDING_GRAPH_URL:
      'https://us-east-2.aws.data.mongodb-api.com/app/data-yqlpb/endpoint/data/v1/action/find',
  },
  ZKLEND: {
    BASE_APR_API: '/zklend/api/pools',
  },
  JEDI: {
    BASE_API: '/jediswap/graphql',
  },
  EKUBO: {
    CLAIMS_URL:
      '/ekubo/airdrops/{{address}}?token=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
    BASE_API: '/ekubo',
  },
  HAIKO: {
    BASE_APR_API: 'haiko/markets?network=mainnet',
  },
  MY_SWAP: {
    POOLS_API: '/myswap/data/pools/all.json',
    BASE_APR_API: '/myswap/data/pools',
  },
  CONTRACTS: {
    Master: '0x50314707690c31597849ed66a494fb4279dc060f8805f21593f52906846e28e',
    AutoStrkFarm:
      '0x541681b9ad63dff1b35f79c78d8477f64857de29a27902f7298f7b620838ea',
    AutoUsdcFarm:
      '0x16912b22d5696e95ffde888ede4bd69fbbc60c5f873082857a47c543172694f',
    DeltaNeutralMMUSDCETH:
      '0x04937b58e05a3a2477402d1f74e66686f58a61a5070fcc6f694fb9a0b3bae422',
    DeltaNeutralMMSTRKETH:
      '0x20d5fc4c9df4f943ebb36078e703369c04176ed00accf290e8295b659d2cea6',
    DeltaNeutralMMETHUSDC:
      '0x9d23d9b1fa0db8c9d75a1df924c3820e594fc4ab1475695889286f3f6df250',
  },
  MOBILE_MSG: 'Desktop/Tablet only',
};

export const TOKENS: TokenInfo[] = [
  {
    token: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
    name: 'ETH',
    decimals: 18,
    displayDecimals: 4,
    logo: CONSTANTS.LOGOS.ETH,
    minAmount: MyNumber.fromEther('10', 18),
    maxAmount: MyNumber.fromEther('10000', 18),
    stepAmount: MyNumber.fromEther('10', 18),
    isERC4626: false,
  },
  {
    token: '0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
    name: 'STRK',
    decimals: 18,
    displayDecimals: 2,
    logo: CONSTANTS.LOGOS.STRK,
    minAmount: MyNumber.fromEther('10', 18),
    maxAmount: MyNumber.fromEther('10000', 18),
    stepAmount: MyNumber.fromEther('10', 18),
    isERC4626: false,
  },
  {
    token: '0x06d8fa671ef84f791b7f601fa79fea8f6ceb70b5fa84189e3159d532162efc21',
    name: 'zSTRK',
    decimals: 18,
    displayDecimals: 2,
    logo: CONSTANTS.LOGOS.STRK,
    minAmount: MyNumber.fromEther('10', 18),
    maxAmount: MyNumber.fromEther('10000', 18),
    stepAmount: MyNumber.fromEther('10', 18),
    isERC4626: false,
  },
  {
    token: '0x1b5bd713e72fdc5d63ffd83762f81297f6175a5e0a4771cdadbc1dd5fe72cb1',
    name: 'zETH',
    decimals: 18,
    displayDecimals: 4,
    logo: CONSTANTS.LOGOS.ETH,
    minAmount: MyNumber.fromEther('0.001', 18),
    maxAmount: MyNumber.fromEther('10000', 18),
    stepAmount: MyNumber.fromEther('0.0001', 18),
    isERC4626: false,
  },
  {
    token: CONSTANTS.CONTRACTS.AutoStrkFarm,
    name: 'frmzSTRK',
    decimals: 18,
    displayDecimals: 2,
    logo: CONSTANTS.LOGOS.STRK,
    minAmount: MyNumber.fromEther('10', 18),
    maxAmount: MyNumber.fromEther('10000', 18),
    stepAmount: MyNumber.fromEther('10', 18),
    isERC4626: true,
  },
  {
    token: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
    name: 'USDC',
    decimals: 6,
    displayDecimals: 2,
    logo: CONSTANTS.LOGOS.USDC,
    minAmount: MyNumber.fromEther('10', 6),
    maxAmount: MyNumber.fromEther('10000', 6),
    stepAmount: MyNumber.fromEther('10', 6),
    isERC4626: false,
  },
  {
    token: '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8',
    name: 'USDT',
    decimals: 6,
    displayDecimals: 2,
    logo: CONSTANTS.LOGOS.USDT,
    minAmount: MyNumber.fromEther('10', 6),
    maxAmount: MyNumber.fromEther('10000', 6),
    stepAmount: MyNumber.fromEther('10', 6),
    isERC4626: false,
  },
  {
    token: '0x047ad51726d891f972e74e4ad858a261b43869f7126ce7436ee0b2529a98f486',
    name: 'zUSDC',
    decimals: 6,
    displayDecimals: 2,
    logo: CONSTANTS.LOGOS.USDC,
    minAmount: MyNumber.fromEther('10', 6),
    maxAmount: MyNumber.fromEther('10000', 6),
    stepAmount: MyNumber.fromEther('10', 6),
    isERC4626: false,
  },
  {
    token: CONSTANTS.CONTRACTS.AutoUsdcFarm,
    name: 'frmzUSDC',
    decimals: 6,
    displayDecimals: 2,
    logo: CONSTANTS.LOGOS.USDC,
    minAmount: MyNumber.fromEther('10', 6),
    maxAmount: MyNumber.fromEther('10000', 6),
    stepAmount: MyNumber.fromEther('10', 6),
    isERC4626: true,
  },
];

export const NFTS: NFTInfo[] = [
  {
    name: 'frmDNMMUSDCETH',
    address: CONSTANTS.CONTRACTS.DeltaNeutralMMUSDCETH,
    logo: CONSTANTS.LOGOS.USDC,
    config: {
      mainTokenName: 'USDC',
    },
  },
  {
    name: 'frmDNMMSTRKETH',
    address: CONSTANTS.CONTRACTS.DeltaNeutralMMSTRKETH,
    logo: CONSTANTS.LOGOS.STRK,
    config: {
      mainTokenName: 'STRK',
    },
  },
  {
    name: 'frmDNMMETHUSDC',
    address: CONSTANTS.CONTRACTS.DeltaNeutralMMETHUSDC,
    logo: CONSTANTS.LOGOS.ETH,
    config: {
      mainTokenName: 'ETH',
    },
  },
];

export const LATEST_TNC_DOC_VERSION = '1.0';

export default CONSTANTS;
