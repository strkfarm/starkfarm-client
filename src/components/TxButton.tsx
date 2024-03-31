import { Box, Button, Spinner } from "@chakra-ui/react"
import { UseContractWriteResult, useAccount, useContractWrite } from "@starknet-react/core"
import { useEffect, useMemo } from "react";
import { isMobile } from 'react-device-detect';
import { Call } from "starknet";

interface TxButtonProps {
    text: string,
    calls: Call[]
}

export default function TxButton(props: TxButtonProps) {
    const {address} = useAccount();
    const disabledStyle = {
        bg: 'var(--chakra-colors-disabled_bg)',
        color: 'var(--chakra-colors-disabled_text)',
        borderColor: 'var(--chakra-colors-disabled_bg)',
        borderWidth: '1px'
    }

    const { writeAsync,
		data,
        status,
        isSuccess,
		isPending } = useContractWrite({
            calls: props.calls
        })

    useEffect(() => {
        console.log('status', isPending, status, isSuccess)
    }, [status])

    const disabledText = useMemo(() => {
        if(isMobile) return "Desktop/Table only";
        if (!address) return "Wallet not connected"
        return ""
    }, [isMobile, address])

    if (disabledText) {
        return <Button 
            _disabled={{
                ...disabledStyle,
            }} 
            _hover={{
                ...disabledStyle,
            }}
            _active={{
                ...disabledStyle,
            }}
            isDisabled={true}
            width={'100%'}
        >
            {disabledText}   
        </Button>
    }
    

    return <Box width={'100%'}>
            <Button color={'purple'} bg='highlight' variant={'ghost'} width={'100%'}
                _active={{
                    bg: 'var(--chakra-colors-bg)'
                }}
                _hover={{
                    bg: 'var(--chakra-colors-bg)'
                }}
                onClick={() => {
                    writeAsync()
                }}
            >
                {isPending && <Spinner size={'sm'} marginRight={'5px'}/>} {props.text}</Button>
        </Box>
}