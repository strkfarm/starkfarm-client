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
    }
}

export default CONSTANTS;