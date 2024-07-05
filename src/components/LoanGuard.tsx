import { addressAtom } from "@/store/claims.atoms";
import { CheckCircleIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, HamburgerIcon, SettingsIcon } from "@chakra-ui/icons";
import { Box, Card, Flex, Skeleton, Text, Stack, Container, Slider, SliderMark, SliderTrack, SliderFilledTrack, SliderThumb, Avatar, Center, HStack, Tag, RangeSlider, RangeSliderTrack, RangeSliderFilledTrack, RangeSliderThumb, Button, MenuList, MenuItem, Menu, MenuButton, Spinner, Icon, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel } from "@chakra-ui/react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { loadable, unwrap } from "jotai/utils";
import { IConfig, Global, Pricer, ZkLend, getMainnetConfig, ContractAddr } from 'strkfarm-sdk';
import { NumberInput } from "./NumberInput";
import { useEffect, useMemo, useState } from "react";
import { getTokenInfoFromName, MyMenuItemProps, MyMenuListProps } from "@/utils";
import LoanGuardAbi from '@/abi/loanguard.abi.json';
import { useContractRead, useContractWrite, useProvider } from "@starknet-react/core";
import { CairoCustomEnum, Call, Contract, Result, Uint256, uint256 } from "starknet";
import CONSTANTS from "@/constants";
import { monitorNewTxAtom } from "@/store/transactions.atom";
import { atomWithQuery } from "jotai-tanstack-query";
import StatusIndicator from "./BlinkDot";

const config = getMainnetConfig();
const provider: any = config.provider;
const contract = new Contract(LoanGuardAbi, CONSTANTS.CONTRACTS.LoanGuard, provider);

const pricerAsyncAtom = atom(async (get) => {
    console.log('tokens')
    const tokens = await Global.getTokens();
    console.log('tokens', tokens);
    const pricer = new Pricer(config, tokens);
    pricer.start();
    await pricer.waitTillReady();
    return pricer
})

const pricerAtom = unwrap(pricerAsyncAtom);

const zkLendAsyncAtom = atom(async (get) => {
    const pricer = get(pricerAtom);

    if (pricer) {
        const zkLend = new ZkLend(config, pricer);
        await zkLend.waitForInitilisation();
        return zkLend
    }
    return undefined;
});
const zkLendAtom = unwrap(zkLendAsyncAtom);
const zkLendInfoAsyncAtom = atom(async (get) => {
    const zkLend = get(zkLendAtom);
    const addr = get(addressAtom);
    console.log('zkLend & addr', zkLend, addr)
    if (zkLend && addr) {
        const positionInfo = await zkLend.getPositionsSummary(ContractAddr.from(addr));
        const hf = await zkLend.get_health_factor(ContractAddr.from(addr));
        return {
            module: zkLend,
            positionInfo,
            hf
        }
    }
    return undefined;
})
const zkLendInfoAtom = unwrap(zkLendInfoAsyncAtom);
const lendingAtoms = atom((get) => [get(zkLendInfoAtom)]);

interface SubscriptionSettings {
    settings: {
        min_health_factor: number;
        max_health_factor: number;
        target_health_factor: number;
        protocol: CairoCustomEnum;
    },
    is_active: boolean;
}

function getApproveCalls(amount: Uint256) {
    return [
        CONSTANTS.CONTRACTS.AutoStrkFarm,
        CONSTANTS.CONTRACTS.AutoUsdcFarm,
        getTokenInfoFromName('zSTRK').token,
        getTokenInfoFromName('zUSDC').token,
    ].map((addr) => {
        const call: Call = {
            contractAddress: addr,
            entrypoint: 'approve',
            calldata: [CONSTANTS.CONTRACTS.LoanGuard, amount.low.toString(), amount.high]
        }
        return call;
    });
}

export default function LoanGuard() {
    const lendingOptions = useAtomValue(lendingAtoms);
    const address = useAtomValue(addressAtom);
    const defaultHealthFactors = [1.15, 1.4, 1.7];
    const [healthFactors, setHealthFactors] = useState(defaultHealthFactors);
    const zkLendEnum = new CairoCustomEnum({ ZkLend: {} });
    const {
        data: _isSubscribed,
        isError: isErrorIsSubscribed,
        isLoading: isLoadingIsSubscribed,
        isPending: isPendingIsSubscribed,
        error: errorIsSubscribed, 
    } = useContractRead({
        abi: LoanGuardAbi,
        address: CONSTANTS.CONTRACTS.LoanGuard,
        functionName: 'get_user_settings',
        args: [address || '0x0', zkLendEnum],
        watch: true
    });
    const isSubscribed: SubscriptionSettings | undefined = useMemo(() => {
        return _isSubscribed as any
    }, [_isSubscribed]);

    const monitorNewTx = useSetAtom(monitorNewTxAtom);

    useEffect(() => {
        console.log('Subscribed', {
            isSubscribed,
            isErrorIsSubscribed,
            isLoadingIsSubscribed,
            isPendingIsSubscribed,
            errorIsSubscribed
        });
    }, [isSubscribed, isErrorIsSubscribed, isLoadingIsSubscribed, isPendingIsSubscribed, errorIsSubscribed])
    
    const activationUpdateCalls = useMemo(() => {
        
        const BASIS_FACTOR = 10000;
        const approveCalls = getApproveCalls(uint256.bnToUint256(uint256.UINT_128_MAX))
        const call = contract.populate('subscribe', {
            protocol: zkLendEnum,
            settings: {
                min_health_factor: healthFactors[0] * BASIS_FACTOR,
                max_health_factor: healthFactors[2] * BASIS_FACTOR,
                target_health_factor: healthFactors[1] * BASIS_FACTOR,
            }
        })
        return [...approveCalls, call];
    }, [healthFactors])

    const {writeAsync: writeAsyncSubscribe, status, isPending, isSuccess, isError, error, data} = useContractWrite({
        calls: activationUpdateCalls
    })

    const unsubscribeCalls = useMemo(() => {
        const approveCalls = getApproveCalls(uint256.bnToUint256("0"))
        const call = contract.populate('unsubscribe', {
            protocol: zkLendEnum
        })
        return [...approveCalls, call];
    }, [])

    const {
        writeAsync: writeAsyncUnSubscribe,
        status: statusUnsub,
        isPending: isPendingUnsub,
        isSuccess: isSuccessUnsub,
        isError: isErrorUnsub,
        error: errorUnsub,
        data: dataUnsub
    } = useContractWrite({
        calls: unsubscribeCalls
    })

    useEffect(() => {
        if (data && data.transaction_hash) {
          monitorNewTx({
            txHash: data.transaction_hash,
            type: 'loanGuard',
            info: {
                actionType: (isSubscribed && isSubscribed.is_active) ? 'update' : 'subscribe',
                protocol: 'zkLend'
            },
            status: 'pending', // 'success' | 'failed'
            createdAt: new Date(),
          });
        }
      }, [status, data]);

      useEffect(() => {
        if (dataUnsub && dataUnsub.transaction_hash) {
          monitorNewTx({
            txHash: dataUnsub.transaction_hash,
            type: 'loanGuard',
            info: {
                actionType: 'unsubscribe',
                protocol: 'zkLend'
            },
            status: 'pending', // 'success' | 'failed'
            createdAt: new Date(),
          });
        }
      }, [dataUnsub]);

    return <Container padding={0} fontFamily={'sans-serif'}>
        <Box display={'flex'} marginBottom={'5px'}>
            <Box width={'60%'}>
                <Text width={'100%'}
                    color='color1'
                    fontWeight={'bold'}
                    paddingRight={'15px'}
                >
                    Do more with your STRKFarm investments
                </Text>
                <Text width={'100%'}
                    color='light_grey'
                    paddingRight={'15px'}
                >
                    Automatically uses your investments to protect your debts from liquidation
                </Text>
            </Box>
            <Box width={'40%'} padding={'10px'} 
                color={isSubscribed && isSubscribed.is_active ? 'purple' : '#cc7d2e'}
                bg='bg'
                borderRadius={'10px'}
            >
                <Flex justifyContent={'space-between'}>
                    <Text>
                        <b>Subscription</b>
                    </Text>
                    {isSubscribed && isSubscribed.is_active && <Text>
                        <b>#3</b>
                    </Text>}
                </Flex>
                <Flex justifyContent={'space-between'}>
                    <Text>
                        {isSubscribed && isSubscribed.is_active ? "Active" : "Inactive"}
                    </Text>
                    {isSubscribed && isSubscribed.is_active && <Text>
                        Rebalances
                    </Text>}
                </Flex>
            </Box>
        </Box>
        <hr style={{margin: '10px 0', borderColor: "var(--chakra-colors-bg)"}}/>
        
        <Box width={'60%'} paddingRight={'15px'} float={'left'} color='light_grey'>
            {lendingOptions.filter(l => l?.module).map((lendingOption) => {
                return <Card bg='bg' padding={'10px'} key={lendingOption?.module.metadata.name}>
                    <Flex justifyContent={'space-between'}>
                        <Flex alignItems={'center'}>
                            <Avatar size={'2xs'} src={lendingOption?.module.metadata.logo} marginRight={'5px'}/> 
                            <Text fontWeight={'bold'} color='purple' fontSize='16px'>{lendingOption?.module.metadata.name}</Text>
                        </Flex>
                        <Flex>
                            {/* <HStack spacing={'1px'}>
                                {Array.from({length: 15}).map((_, i) => {
                                    return <Box key={i} width={'2px'} height={'10px'} bg='green'/>
                                })}
                            </HStack> */}
                            <StatusIndicator isActive={isSubscribed && isSubscribed.is_active ? true : false} />
                        </Flex>
                    </Flex>
                    <Flex marginTop={'10px'} justifyContent={'space-between'}>
                        <Box>
                            <Tag marginRight={'10px'} variant={'outline'}><b>Deposits:</b>{' '}${lendingOption?.positionInfo.collateralUSD.toLocaleString()}</Tag>
                            <Tag marginRight={'10px'} variant={'outline'}><b>Borrows:</b>{' '}${lendingOption?.positionInfo.debtUSD.toLocaleString()}</Tag>
                        </Box>
                        <Box color={'light_grey'}>
                            {Number(lendingOption?.hf) != Infinity && <Tag bg='purple' color='bg' alignItems={'center'}>
                                <Flex alignItems={'center'}><Text fontSize={'13px'} fontWeight={'bold'}>Health: {lendingOption?.hf.toFixed(2)}
                                    </Text>
                                    <CheckCircleIcon marginLeft={'5px'}/>
                                </Flex>
                            </Tag>}
                            {lendingOption?.hf == Infinity && <Text>No debt</Text>}
                        </Box>
                    </Flex>
                    <hr style={{margin: '10px 0', borderColor: "var(--chakra-colors-highlight)"}}/>
                    {isSubscribed && isSubscribed.is_active && <Flex  justifyContent={'start'}>
                        <Tag marginRight={'10px'} variant={'solid'}><b>Min: {(Number(isSubscribed.settings.min_health_factor) / 10000).toFixed(2)}</b></Tag>
                        <Tag marginRight={'10px'} variant={'solid'}><b>Target: {(Number(isSubscribed.settings.target_health_factor) / 10000).toFixed(2)}</b></Tag>
                        <Tag variant={'solid'}><b>Max: {(Number(isSubscribed.settings.max_health_factor) / 10000).toFixed(2)}</b></Tag>
                    </Flex>}
                </Card>
            })}

            <Card bg='bg' padding={'10px'} marginTop={'10px'}>
                    <Flex justifyContent={'space-between'}>
                        <Flex alignItems={'center'}>
                            <Avatar size={'2xs'} src={'https://app.nostra.finance/favicon.svg'} marginRight={'5px'}/> 
                            <Text fontWeight={'bold'} color='purple' fontSize='16px'>Nostra</Text>
                        </Flex>
                        <Flex>
                            {/* <HStack spacing={'1px'}>
                                {Array.from({length: 15}).map((_, i) => {
                                    return <Box key={i} width={'2px'} height={'10px'} bg='green'/>
                                })}
                            </HStack> */}
                        </Flex>
                    </Flex>
                    <Flex marginTop={'10px'} justifyContent={'space-between'}>
                        <Box>
                            <Tag variant={'outline'} marginRight={'10px'}>Coming soon</Tag>
                        </Box>
                    </Flex>
                </Card>

            {lendingOptions.filter(l => l).length == 0 && <Stack>
                <Skeleton height='70px' />
                <Skeleton height='70px' />
            </Stack>}
        </Box>
        <Box width={'40%'} float={'left'}>
            <Box width={'100%'} bg='bg' borderRadius={'7px'} padding={'10px'}>
                <Flex color='light_grey' alignItems={'center'} marginBottom={'5px'}>
                    <SettingsIcon boxSize='4' marginRight={'5px'}/>
                    <Text as='h3'>Settings</Text>
                </Flex>

                <Menu>
                <MenuButton as={Button} height={'100%'} rightIcon={<ChevronDownIcon />} bgColor={'highlight'} borderColor={'bg'} borderWidth={'1px'} color='color2Text'
                    _hover={{
                        bg: "bg"
                    }}
                    padding={'10px'}
                    marginBottom={'10px'}
                >
                    <Center>zkLend</Center>
                </MenuButton>
                <MenuList {...MyMenuListProps}>
                    <MenuItem {...MyMenuItemProps} key='zkLend'
                        onClick={() => {
                            
                        }}
                    >
                        zkLend
                    </MenuItem>
                    <MenuItem {...MyMenuItemProps} key='nostra'
                        onClick={() => {
                            
                        }}
                    >
                        Nostra
                    </MenuItem>
                </MenuList>
                </Menu>
                <Flex justifyContent={'space-between'}>
                    <Text color={'light_grey'} fontSize={'13px'}>Required health factor range:</Text>
                    <Text color={'purple'} fontSize={'12px'} onClick={() => {
                            setHealthFactors(defaultHealthFactors);
                        }}
                        cursor={'pointer'}
                    >[Suggest]</Text>
                </Flex>
                <RangeSlider aria-label={['min', 'target', 'max']} defaultValue={defaultHealthFactors} 
                    min={1} max={3} step={0.05}
                    value={healthFactors}
                    onChange={(values) => {
                        let _values = values as number[];
                        if (_values[0] < 1.1) _values[0] = 1.1;
                        if (_values[0] >= _values[1]) {
                            _values[1] = _values[0] + 0.1;
                        }
                        if (_values[1] >= _values[2]) {
                            _values[2] = _values[1] + 0.1;
                        }
                        setHealthFactors(_values);
                    }}
                >
                    <RangeSliderTrack bg='highlight'>
                        <RangeSliderFilledTrack bg='purple'/>
                    </RangeSliderTrack>
                    <RangeSliderThumb index={0}>
                        <Box as={ChevronLeftIcon} bg='purple' borderRadius={'10px'} color='white'></Box>
                    </RangeSliderThumb>
                    <RangeSliderThumb index={1}>
                        <Box as={CheckCircleIcon} bg='purple' borderRadius={'10px'} color='white'></Box>
                    </RangeSliderThumb>
                    <RangeSliderThumb index={2}>
                        <Box as={ChevronRightIcon} bg='purple' borderRadius={'10px'} color='white'></Box>
                    </RangeSliderThumb>
                </RangeSlider>

                <Stack color='light_grey' fontSize={'13px'} marginTop={'10px'} gap={'2px'}>
                    <Flex alignItems={'center'}>
                        <Text marginRight={'5px'}><b>Min health factor:</b></Text>
                        <Text color='cyan' fontSize={'14px'}>{healthFactors[0]}</Text>
                    </Flex>
                    <Flex alignItems={'center'}>
                        <Text marginRight={'5px'}><b>Target health factor:</b></Text>
                        <Text color='cyan' fontSize={'14px'}>{healthFactors[1]}</Text>
                    </Flex>
                    <Flex alignItems={'center'}>
                        <Text marginRight={'5px'}><b>Max health factor:</b></Text>
                        <Text color='cyan' fontSize={'14px'}>{healthFactors[2]}</Text>
                    </Flex>
                </Stack>

                <HStack width={'100%'}>
                    <Center width={isSubscribed && isSubscribed.is_active ? 'auto': '100%'}>
                        <Button size={'sm'} marginTop={'20px'} bg='purple'
                            onClick={() => {
                                writeAsyncSubscribe();
                            }}
                            isDisabled={isPending}
                            minWidth={'150px'}
                        >
                            {isPending || !isSubscribed ? <Spinner size={'sm'}/> : <></>}
                            {isSubscribed && !isSubscribed.is_active && "Subscribe"}
                            {isSubscribed && isSubscribed.is_active && "Update"}
                        </Button>
                    </Center>
                    {
                        isSubscribed && 
                        isSubscribed.is_active &&
                        <Button size={'sm'} marginTop={'20px'} bg='bg' color='light_grey' 
                        borderColor='light_grey' variant={'outline'} flex={1}
                            onClick={() => {
                                writeAsyncUnSubscribe();
                            }}
                            isDisabled={isPendingUnsub}
                        >Unsubscribe</Button>
                    }
                </HStack>
            </Box>
        </Box>

        <Accordion marginTop={'10px'} float={'left'} borderColor={'bg'} width={'100%'}>
            <AccordionItem bg='bg' borderRadius={'5px'}>
                <h2>
                <AccordionButton color='light_grey'>
                    <Box as='span' flex='1' textAlign='left'>
                        Rebalance history
                    </Box>
                    <AccordionIcon />
                </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                    
                </AccordionPanel>
            </AccordionItem>
        </Accordion>
    </Container>
}
