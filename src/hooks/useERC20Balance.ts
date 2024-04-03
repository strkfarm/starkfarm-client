import ERC20Abi from '@/abi/erc20.abi.json';
import { TokenInfo } from '@/strategies/IStrategy';
import MyNumber from '@/utils/MyNumber';
import { useAccount, useContractRead } from '@starknet-react/core';
import { useEffect, useMemo } from 'react';
import { BlockTag } from 'starknet';

export function useERC20Balance(token: TokenInfo | undefined) {
    const { address } = useAccount();

    const { data, isError, isLoading, error } = useContractRead({
        functionName: "balanceOf",
        args: [address || '0x0'],
        abi: ERC20Abi,
        address: token?.token || '0x0',
        watch: true,
        blockIdentifier: BlockTag.pending
    });

    const result = useMemo(() => {
        console.log('balance', {address, data, isLoading, isError})
        if (!address || !token) return {
            balance: MyNumber.fromZero(),
            isLoading: false,
            isError: false
        }
        let balance = MyNumber.fromZero();
        if (data) {
            balance = new MyNumber(data.toString(), token.decimals);
        }
        return {
            balance, isLoading, isError
        }
    }, [address, data, isLoading, isError, error])

    useEffect(() => {
        console.log('balance', {address, data, isLoading, isError, result})
    }, [address, data, isLoading, isError, error, result])
    return result
}