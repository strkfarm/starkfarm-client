import { ChevronDownIcon } from "@chakra-ui/icons";
import { Box, Button, Center, Grid, GridItem, Image as ImageC, Menu, MenuButton, MenuItem, MenuList, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Text, Tooltip, usePrevious } from "@chakra-ui/react";
import LoadingWrap from "./LoadingWrap";
import { IStrategyActionHook, TokenInfo } from "@/strategies/IStrategy";
import { useERC20Balance } from "@/hooks/useERC20Balance";
import { StrategyInfo } from "@/store/strategies.atoms";
import { useEffect, useMemo, useState } from "react";
import MyNumber from "@/utils/MyNumber";
import TxButton from "./TxButton";
import { MyMenuItemProps, MyMenuListProps } from "@/utils";
import { PrefixPathnameNormalizer } from "next/dist/server/future/normalizers/request/prefix";
import { useAccount, useProvider } from "@starknet-react/core";
import { ProviderInterface } from "starknet";

interface DepositProps {
    strategy: StrategyInfo,
    buttonText: string,
    callsInfo: (amount: MyNumber, address: string, provider: ProviderInterface) => IStrategyActionHook[]
}

export default function Deposit(props: DepositProps) {
    const { address } = useAccount();
    const { provider } = useProvider();
    const [amount, setAmount] = useState(MyNumber.fromZero());

    const [selectedMarket, setSelectedMarket] = useState(props.callsInfo(amount, address || '0x0', provider)[0].tokenInfo);
    
    const {calls, actions} = useMemo(() => {
        const actions = props.callsInfo(amount, address || '0x0', provider)
        const hook = actions.find(a => a.tokenInfo.name == selectedMarket.name)
        if (!hook) return {calls: [], actions};
        return {calls: hook.calls, actions}
    }, [selectedMarket, amount, address, provider])

    useEffect(() => {
        console.log('hookkkAmount', amount.toEtherStr(), calls)
    }, [amount, calls])

    function getBalanceComponent(token: TokenInfo) {
        const { balance, isLoading, isError} = useERC20Balance(token); 
        return <Box color={'light_grey'} textAlign={'right'}>
            <Text>Available balance: </Text>
            <LoadingWrap isLoading={isLoading} isError={isError} 
                skeletonProps={{
                    height: '10px', width:'50px', float: 'right', marginTop: '8px', marginLeft: '5px'
                }}
                iconProps={{
                    marginLeft: '5px',
                    boxSize: '15px'
                }}
            >
                <b style={{marginLeft: '5px'}}>{balance.toEtherToFixedDecimals(token.displayDecimals)}</b>
            </LoadingWrap>
        </Box>
    }

    return <Box>
        <Grid templateColumns='repeat(5, 1fr)' gap={6}>
            <GridItem colSpan={2}>
                <Menu>
                    <MenuButton as={Button} height={'100%'}  rightIcon={<ChevronDownIcon />} bgColor={'highlight'} borderColor={'bg'} borderWidth={'1px'} color='purple'>
                        <Center><ImageC src={selectedMarket.logo.src} alt='' width={'20px'} marginRight='5px'/> {selectedMarket.name}</Center>
                    </MenuButton>
                    <MenuList {...MyMenuListProps}>
                        {actions.map(dep => 
                            <MenuItem key={dep.tokenInfo.name} {...MyMenuItemProps}
                                onClick={() => {
                                    if (selectedMarket.name != dep.tokenInfo.name) {
                                        setSelectedMarket(dep.tokenInfo)
                                    }
                                }}
                            >
                                <Center><ImageC src={dep.tokenInfo.logo.src} alt='' width={'20px'} marginRight='5px'/> {dep.tokenInfo.name}</Center>
                            </MenuItem>
                        )}
                    </MenuList>
                </Menu>
            </GridItem>
            <GridItem colSpan={3}>
                {getBalanceComponent(selectedMarket)}
            </GridItem>
        </Grid>
        
        {/* add min max validations and show err */}
        <NumberInput 
            min={0} 
            max={parseFloat(selectedMarket.maxAmount.toEtherStr())} 
            step={parseFloat(selectedMarket.stepAmount.toEtherStr())} 
            color={"white"} bg={'bg'} borderRadius={'10px'}
            onChange={(value) => {
                if (value && Number(value) > 0)
                    setAmount(MyNumber.fromEther(value, selectedMarket.decimals));
                else {
                    setAmount(MyNumber.fromZero());
                }
            }}
            marginTop={'10px'}
        >
            <NumberInputField border={'0px'} borderRadius={'10px'} placeholder="Amount"/>
            <NumberInputStepper>
                <NumberIncrementStepper color={'white'} border={'0px'} />
                <NumberDecrementStepper color={'white'} border={'0px'}/>
            </NumberInputStepper>
        </NumberInput>

        <Center marginTop={'10px'}><TxButton text={`${props.buttonText}: ${amount.toEtherToFixedDecimals(2)} ${selectedMarket.name}`} calls={calls}/></Center>
    </Box>
}