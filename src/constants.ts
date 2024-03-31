import { TokenInfo } from "./strategies/IStrategy";
import MyNumber from "./utils/MyNumber";

const LOGOS = {
    USDT: "https://app.zklend.com/icons/tokens/usdt.svg?w=20",
    USDC: "https://app.zklend.com/icons/tokens/usdc.svg?w=20",
    WBTC: "https://app.zklend.com/icons/tokens/wbtc.svg?w=20",
    ETH: "https://app.zklend.com/icons/tokens/eth.svg?w=20",
    STRK: "https://app.zklend.com/icons/tokens/strk.svg?w=20",
    DAI: "https://app.zklend.com/icons/tokens/dai.svg?w=20"
}

export type TokenName = 'USDT' | 'USDC' | 'ETH' | 'STRK' | 'WBTC' | 'DAI'
const CONSTANTS = {
    DEX_INCENTIVE_URL: 'https://kx58j6x5me.execute-api.us-east-1.amazonaws.com/starknet/fetchFile?file=strk_grant.json',
    LENDING_INCENTIVES_URL: 'https://kx58j6x5me.execute-api.us-east-1.amazonaws.com/starknet/fetchFile?file=prod-api/lending/lending_strk_grant.json',
    LOGOS,
    COMMUNITY_TG:'https://t.me/+HQ_eHaXmF-1lZDc1',
    NOSTRA: {
        LENDING_GRAPH_URL: 'https://us-east-2.aws.data.mongodb-api.com/app/data-yqlpb/endpoint/data/v1/action/find',
    },
    ZKLEND: {
        BASE_APR_API: 'https://app.zklend.com/api/pools'
    },
    JEDI: {
        BASE_API: 'https://api.jediswap.xyz/graphql'
    },
    EKUBO: {
        CLAIMS_URL: 'https://mainnet-api.ekubo.org/airdrops/{{address}}?token=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d'
    },
    CONTRACTS: {
        Master: '0x50314707690c31597849ed66a494fb4279dc060f8805f21593f52906846e28e',
        AutoStrkFarm: '0x541681b9ad63dff1b35f79c78d8477f64857de29a27902f7298f7b620838ea',
        AutoUsdcFarm: '0x16912b22d5696e95ffde888ede4bd69fbbc60c5f873082857a47c543172694f'
    },
    MOBILE_MSG: 'Desktop/Table only'
}

export const TOKENS: TokenInfo[] = [{
    token: '0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
    name: 'STRK',
    decimals: 18,
    displayDecimals: 2,
    logo: CONSTANTS.LOGOS.STRK,
    minAmount: MyNumber.fromEther('10', 18),
    maxAmount: MyNumber.fromEther('10000', 18),
    stepAmount: MyNumber.fromEther('10', 18),
}, {
    token: '0x06d8fa671ef84f791b7f601fa79fea8f6ceb70b5fa84189e3159d532162efc21',
    name: 'zSTRK',
    decimals: 18,
    displayDecimals: 2,
    logo: CONSTANTS.LOGOS.STRK,
    minAmount: MyNumber.fromEther('10', 18),
    maxAmount: MyNumber.fromEther('10000', 18),
    stepAmount: MyNumber.fromEther('10', 18),
}, {
    token: CONSTANTS.CONTRACTS.AutoStrkFarm,
    name: 'frmzSTRK',
    decimals: 18,
    displayDecimals: 2,
    logo: CONSTANTS.LOGOS.STRK,
    minAmount: MyNumber.fromEther('10', 18),
    maxAmount: MyNumber.fromEther('10000', 18),
    stepAmount: MyNumber.fromEther('10', 18),
},{
    token: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
    name: 'USDC',
    decimals: 6,
    displayDecimals: 2,
    logo: CONSTANTS.LOGOS.USDC,
    minAmount: MyNumber.fromEther('10', 6),
    maxAmount: MyNumber.fromEther('10000', 6),
    stepAmount: MyNumber.fromEther('10', 6),
}, {
    token: '0x047ad51726d891f972e74e4ad858a261b43869f7126ce7436ee0b2529a98f486',
    name: 'zUSDC',
    decimals: 6,
    displayDecimals: 2,
    logo: CONSTANTS.LOGOS.USDC,
    minAmount: MyNumber.fromEther('10', 6),
    maxAmount: MyNumber.fromEther('10000', 6),
    stepAmount: MyNumber.fromEther('10', 6),
}, {
    token: CONSTANTS.CONTRACTS.AutoUsdcFarm,
    name: 'frmzUSDC',
    decimals: 6,
    displayDecimals: 2,
    logo: CONSTANTS.LOGOS.USDC,
    minAmount: MyNumber.fromEther('10', 6),
    maxAmount: MyNumber.fromEther('10000', 6),
    stepAmount: MyNumber.fromEther('10', 6),
}]

export default CONSTANTS;