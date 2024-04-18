'use client';

import Navbar from "@/components/Navbar";
import EkuboAtoms from "@/store/ekobu.store";
import Ekubo from "@/store/ekobu.store";
import Jediswap from "@/store/jedi.store";
import { PoolInfo, StrkDexIncentivesAtom, allPoolsAtomUnSorted, filteredPools, sortPoolsAtom } from "@/store/pools";
import { Avatar, AvatarGroup, Box, Button, Card, CardBody, CardHeader, Center, Container, Flex, Grid, GridItem, HStack, Heading, Image, Input, Link, LinkBox, LinkOverlay, ListItem, Menu, MenuButton, MenuItem, MenuList, NumberInput, OrderedList, Skeleton, Spinner, Stack, Stat, StatHelpText, StatLabel, StatNumber, Tab, TabIndicator, TabList, TabPanel, TabPanels, Tabs, Text, Tooltip, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import useSWR from 'swr';
import { Pagination, PaginationContainer, usePagination, PaginationNext, PaginationPrevious, PaginationPage, PaginationPageGroup } from '@ajna/pagination';
import CONSTANTS from "@/constants";
import Filters from "@/components/Filters";
import tg from '@/assets/tg.svg';
import Pools from "@/components/Pools";
import Strategies from "@/components/Strategies";
import mixpanel from "mixpanel-browser";
import { useSearchParams } from 'next/navigation';
import { StrategyInfo, strategiesAtom } from "@/store/strategies.atoms";
import { getUniqueById } from "@/utils";
import { ChevronDownIcon } from "@chakra-ui/icons";
import LoadingWrap from "@/components/LoadingWrap";
import Deposit from "@/components/Deposit";
import MyNumber from "@/utils/MyNumber";
import { useERC20Balance } from "@/hooks/useERC20Balance";
import { useAccount } from "@starknet-react/core";
import { isMobile } from "react-device-detect";
import { useERC4626Value } from "@/hooks/useERC4626Value";

export default function Strategy() {
  const { address } = useAccount();
  const searchParams = useSearchParams();
  const strategies = useAtomValue(strategiesAtom);

  const strategy: StrategyInfo | undefined = useMemo(() => {
    const name = searchParams.get('name');
    console.log('name', name);
    return strategies.find(s => s.name == name);
  }, [searchParams, strategies]);

  const {balance, underlyingTokenInfo, isLoading, isError} = useERC4626Value(strategy?.holdingTokens[0]); // @todo need to add multi token support
  
  useEffect(() => {
    mixpanel.track('Strategy page open', {name: searchParams.get('name')});
  }, []);

  const colSpan1: any = {base: '5', md: '3'};
  const colSpan2: any = {base: '5', md: '2'};
  return (
    <Container maxWidth={'1000px'} margin={'0 auto'} padding='30px 10px' fontFamily={"sans-serif"}>
        <Flex marginBottom={'10px'}>
          <Avatar marginRight={'5px'} src={strategy?.holdingTokens[0].logo}/>
          <Text marginTop={'6px'} color='white' fontSize={{base: '18px', md: '25px'}} fontWeight={'bold'}>{strategy ? strategy.name : "Strategy Not found"}</Text>
        </Flex>
        {strategy && <VStack width={'100%'}>
          <Grid width={'100%'} templateColumns='repeat(5, 1fr)' gap={2}>
            <GridItem display='flex' colSpan={colSpan1}>
              <Card width='100%' padding={'15px'} color='white' bg='highlight'>
                <Box display={{base: 'block', md: 'flex'}}>
                  <Box width={{base: '100%', md: '80%'}} float={'left'}>
                    <Text fontSize={'20px'} marginBottom={'0px'} fontWeight={'bold'}>How does it work?</Text>
                    <Text color='light_grey' marginBottom='5px' fontSize={'15px'}>{strategy.description}</Text>
                    <Wrap>
                        {getUniqueById(strategy.actions.map(p => ({id: p.pool.protocol.name, logo: p.pool.protocol.logo}))).map(p => <WrapItem marginRight={'10px'} key={p.id}>
                            <Center>
                                <Avatar size='2xs' bg={'black'} src={p.logo} marginRight={'2px'} />
                                <Text marginTop={'2px'}>{p.id}</Text>
                            </Center>
                        </WrapItem>)}
                    </Wrap>
                  </Box>
                  <Box width={{base: '100%', md: '20%'}} float={'left'} marginTop={{base: '10px'}}>
                    <Stat>
                      <StatLabel textAlign={{base: 'left', md: 'right'}}>APY</StatLabel>
                      <StatNumber color='cyan' textAlign={{base: 'left', md: 'right'}}>{(strategy.netYield * 100).toFixed(2)}%</StatNumber>
                      <StatHelpText textAlign={{base: 'left', md: 'right'}}>{strategy.leverage.toFixed(2)}x boosted</StatHelpText>
                    </Stat>
                  </Box>
                </Box>
                <Box padding={'10px'} borderRadius={'10px'} bg={'purple'} marginTop={'20px'}>
                  {!isLoading && <Text><b>Your Holdings: </b>{address ? `${balance.toEtherToFixedDecimals(4)} ${underlyingTokenInfo?.name}` : (isMobile ? CONSTANTS.MOBILE_MSG : 'Connect wallet')}</Text>}
                  {isLoading && <Text><b>Your Holdings: </b>{address ? <Spinner size='sm' marginTop={'5px'}/> : (isMobile ? CONSTANTS.MOBILE_MSG : 'Connect wallet')}</Text>}
                </Box>
              </Card>
            </GridItem>
            <GridItem display='flex' colSpan={colSpan2}>
              <Card width='100%' padding={'15px'} color='white' bg='highlight'>
              <Tabs position="relative" variant='unstyled' width={'100%'}>
                <TabList>
                  <Tab color='light_grey' _selected={{ color: 'color2' }} onClick={() => {
                    // mixpanel.track('All pools clicked')
                  }}>Deposit</Tab >
                  <Tab  color='light_grey' _selected={{ color: 'color2' }} onClick={() => {
                    // mixpanel.track('Strategies opened')
                  }}>Withdraw</Tab>
                </TabList>
                <TabIndicator
                  mt="-1.5px"
                  height="2px"
                  bg="color2"
                  color='color1'
                  borderRadius="1px"
                />
                <TabPanels>
                  <TabPanel bg='highlight' float={'left'} width={'100%'} padding={'10px 0'}>
                    <Deposit strategy={strategy} buttonText="Deposit" callsInfo={strategy.depositMethods}/>
                  </TabPanel>
                  <TabPanel bg='highlight' width={'100%'} float={'left'} padding={'10px 0'}>
                    <Deposit strategy={strategy} buttonText="Withdraw" callsInfo={strategy.withdrawMethods}/>
                  </TabPanel>
                </TabPanels>
              </Tabs>
                
              </Card>
            </GridItem>
          </Grid>
          <Card width={'100%'} color='white' bg='highlight' padding={'15px'}>
              <Text fontSize={'20px'} marginBottom={'0px'} fontWeight={'bold'}>Behind the scenes</Text>
              <Text fontSize={'15px'} marginBottom={'10px'}>Assuming a capital of $1000, below are all the actions executed</Text>
              <Flex color='white' width={'100%'} className="text-cell" display={{base: 'none', md: 'flex'}}>
                  <Text width={'50%'} padding={'5px 10px'}>Action</Text>
                  <Text width={'30%'} textAlign={'left'} padding={'5px 10px'}>Protocol</Text>
                  <Text width={'10%'} textAlign={'right'} padding={'5px 10px'}>Amount</Text>
                  <Text width={'10%'} textAlign={'right'} padding={'5px 10px'}>Yield</Text>
              </Flex>
              {strategy.actions.map((action, index) => <Box className="text-cell" 
                display={{base: 'block', md: 'flex'}} 
                key={index} width={'100%'} 
                color='light_grey' 
                fontSize={'14px'}
              >
                  <Text width={{base: '100%', md: '50%'}} padding={'5px 10px'}>{index + 1}) {action.name}</Text>
                  <Text width={{base: '100%', md: '30%'}} padding={'5px 10px'}>
                    <Avatar size='2xs' bg={'black'} src={action.pool.pool.logos[0]} marginRight={'2px'} /> {action.pool.pool.name} on 
                    <Avatar size='2xs' bg={'black'} src={action.pool.protocol.logo} marginRight={'2px'} marginLeft={'5px'}/> {action.pool.protocol.name}
                  </Text>
                  <Text display={{base: 'block', md: 'none'}} width={{base: '100%', md: '10%'}} padding={'5px 10px'}>${Number(action.amount).toLocaleString()} yields {action.isDeposit ? (action.pool.apr * 100).toFixed(2) : -(action.pool.borrow.apr*100).toFixed(2)}%</Text>
                  <Text display={{base: 'none', md: 'block'}} width={{base: '100%', md: '10%'}} className="text-cell" textAlign={'right'} padding={'5px 10px'}>${Number(action.amount).toLocaleString()}</Text>
                  <Text display={{base: 'none', md: 'block'}} width={{base: '100%', md: '10%'}} className="text-cell" textAlign={'right'} padding={'5px 10px'}>{action.isDeposit ? (action.pool.apr * 100).toFixed(2) : -(action.pool.borrow.apr*100).toFixed(2)}%</Text>
              </Box>)}
          </Card>
          <Card width={'100%'} color='white' bg='highlight' padding={'15px'}>
              <Text fontSize={'20px'} marginBottom={'10px'} fontWeight={'bold'}>Risks</Text>
              <OrderedList>
                {strategy.risks.map(r => <ListItem color='light_grey' key={r} fontSize={'14px'} marginBottom={'5px'}>{r}</ListItem>)}
              </OrderedList>
          </Card>
        </VStack>}
    </Container>
  );
}
