import { NextResponse } from "next/server";
import { ec, hash, num } from "starknet";
import BigNumber from "bignumber.js";
import { standariseAddress } from "@/utils";
import { PrismaClient } from '@prisma/client';
import { starknetChainId } from "@starknet-react/core";
import { mainnet } from "@starknet-react/chains";

export const revalidate = 0;

const prisma = new PrismaClient();
const tenPow18 = new BigNumber(10).pow(18);

export async function GET(req: Request, context: any) {
    try {
        const { params } = context;
        const addr = params.address;

        // standardised address
        let pAddr = addr;
        try {
            pAddr = standariseAddress(addr);
        } catch (e) {
            throw new Error('Invalid address');
        }

        let queryAddr = pAddr;
        
        if(!process.env.ACCOUNT_PK) {
            throw new Error('Invalid signer');
        }

        const isOgUser = await prisma.user.findUnique({
            where: {
                address: queryAddr
            },
            include: {
                og_nft_users: true
            }
        });
        const isOgNFTUser = isOgUser && isOgUser.og_nft_users ? true : false;

        if (!isOgUser) {
            return NextResponse.json({
                address: '',
                hash: '',
                sig: [] 
            }, {
                status: 404
            })
        }

        const hash1 = hash.computePedersenHash(pAddr, 0);
            
        const sig = ec.starkCurve.sign(hash1, process.env.ACCOUNT_PK);

        return NextResponse.json({
            address: pAddr,
            isOgNFTUser,
            hash: hash1,
            sig: [sig.r.toString(), sig.s.toString()] 
        })
    } catch(err) {
        console.error('Error /api/users/:address', err);
        return NextResponse.json({
            address: '',
            hash: '',
            sig: [] 
        }, {
            status: 500
        })
    }
}