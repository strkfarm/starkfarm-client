import CONSTANTS from "@/constants";
import { atomWithQuery } from "jotai-tanstack-query";
import { unstable_renderSubtreeIntoContainer } from "react-dom";
import { atomWithStorage, createJSONStorage } from 'jotai/utils'

export interface BlockInfo {
    "data": {
        "blocks": {
                "id": string,
                "number": number,
                "timestamp": string, // "2024-03-15T08:54:05",
                "__typename": "Block"
        }[]
    }
}

export async function getBlock(tSeconds: number, retry = 0): Promise<BlockInfo> {
    try {
        const data = JSON.stringify({
            query: `query blocks {
            blocks(first: 1, orderBy: "timestamp", orderByDirection: "asc", where: {timestampGt: ${tSeconds}}) {
                id
                number
                timestamp
                __typename
            }
            }`, variables: {}
        });
        console.log('jedi base', 'data', data)
        const res = await fetch(CONSTANTS.JEDI.BASE_API, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: data
        })
        const blockInfo = await res.json();
        console.log('jedi base data', blockInfo, tSeconds)
        return blockInfo;
    } catch(err) {
        console.log('err', err)
        if (retry < 3) {
            await new Promise((res) => setTimeout(res, 2000))
            return await getBlock(tSeconds, retry + 1);
        }
        throw err;
    }
}

export const blockInfoNowAtom = atomWithQuery((get) => ({
    queryKey: ['block_now'],
    queryFn: async ({ queryKey: [] }): Promise<BlockInfo> => {
        console.log('jedi base', 'block now')
        const nowSeconds = Math.round((new Date().getTime()) / 1000);
        const res = await getBlock(nowSeconds)
        console.log('jedi base', 'data2', res)
        return res;
    },
}))


export const blockInfoMinus1DAtom = atomWithQuery((get) => ({
    queryKey: ['block_minus_1d'],
    queryFn: async ({ queryKey: [] }) => {
        console.log('jedi base', 'block_minus_1d')
        const nowSeconds = Math.round((new Date().getTime()) / 1000);
        const NowMinus1DSeconds = nowSeconds - 86400;
        const data = JSON.stringify({
            query: `query blocks {
            blocks(first: 1, orderBy: "timestamp", orderByDirection: "asc", where: {timestampGt: ${NowMinus1DSeconds}}) {
                id
                number
                timestamp
                __typename
            }
            }`, variables: {}
        });
        console.log('jedi base', 'data', data)
        const res = await fetch(CONSTANTS.JEDI.BASE_API, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: data
        })
        console.log('jedi base', 'data2', res.json())
        return res.json()
    },
}))

const ISSERVER = typeof window === "undefined";
declare let localStorage: any;

export type WalletName = 'Braavos' | 'Argent X'
export const lastWalletAtom = atomWithStorage<null | WalletName>('lastWallet', null, {                
    ...createJSONStorage(() => {
        if(!ISSERVER) return localStorage
        return null;
    }),                                            
  }, {
    getOnInit: true
  });