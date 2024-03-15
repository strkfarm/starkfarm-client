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
    DEX_INCENTIVE_URL: 'https://kx58j6x5me.execute-api.us-east-1.amazonaws.com//starknet/fetchFile?file=qa_strk_grant.json',
    LENDING_INCENTIVES_URL: 'https://kx58j6x5me.execute-api.us-east-1.amazonaws.com/starknet/fetchFile?file=qa_lending_strk_grant.json',
    LOGOS,
    COMMUNITY_TG:'https://t.me/+HQ_eHaXmF-1lZDc1'
}

export default CONSTANTS;