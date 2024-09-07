'use client';

import {
  Avatar,
  Box,
  Card,
  Center,
  Flex,
  Grid,
  GridItem,
  Link,
  ListItem,
  OrderedList,
  Spinner,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useAccount } from '@starknet-react/core';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import mixpanel from 'mixpanel-browser';
import { useEffect, useMemo, useState } from 'react';
import { isMobile } from 'react-device-detect';

import Deposit from '@/components/Deposit';
import CONSTANTS from '@/constants';
import { DUMMY_BAL_ATOM } from '@/store/balance.atoms';
import { StrategyInfo, strategiesAtom } from '@/store/strategies.atoms';
import {
  StrategyTxPropsToMessageWithStrategies,
  transactionsAtom,
} from '@/store/transactions.atom';
import { getUniqueById, shortAddress } from '@/utils';
import { StrategyParams } from '../page';

const Strategy = ({ params }: StrategyParams) => {
  const { address } = useAccount();
  const strategies = useAtomValue(strategiesAtom);
  const transactions = useAtomValue(transactionsAtom);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    console.log('txs', transactions);
  }, [transactions]);

  const strategy: StrategyInfo | undefined = useMemo(() => {
    const id = params.strategyId;

    console.log('id', id);

    return strategies.find((s) => s.id === id);
  }, [params.strategyId, strategies]);

  const setBalQueryEnable = useSetAtom(strategy?.balEnabled || atom(false));

  useEffect(() => {
    setBalQueryEnable(true);
  }, []);

  // const balAtom = getBalanceAtom(strategy?.holdingTokens[0]);
  const balData = useAtomValue(strategy?.balanceAtom || DUMMY_BAL_ATOM);
  // cons{ balance, underlyingTokenInfo, isLoading, isError }
  useEffect(() => {
    console.log(
      'balData',
      balData.isError,
      balData.isLoading,
      balData.isPending,
      balData.data,
      balData.error,
    );
  }, [balData]);

  useEffect(() => {
    mixpanel.track('Strategy page open', { name: params.strategyId });
  }, [params.strategyId]);

  const colSpan1: any = { base: '5', md: '3' };
  const colSpan2: any = { base: '5', md: '2' };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <Flex marginBottom={'10px'}>
        <Avatar marginRight={'5px'} src={strategy?.holdingTokens[0].logo} />
        <Text
          marginTop={'6px'}
          fontSize={{ base: '18px', md: '25px' }}
          fontWeight={'bold'}
          color="white"
        >
          {strategy ? strategy.name : 'Strategy Not found'}
        </Text>
      </Flex>
      {strategy && (
        <VStack width={'100%'}>
          <Grid width={'100%'} templateColumns="repeat(5, 1fr)" gap={2}>
            <GridItem display="flex" colSpan={colSpan1}>
              <Card width="100%" padding={'15px'} color="white" bg="highlight">
                <Box display={{ base: 'block', md: 'flex' }}>
                  <Box width={{ base: '100%', md: '80%' }} float={'left'}>
                    <Text
                      fontSize={'20px'}
                      marginBottom={'0px'}
                      fontWeight={'bold'}
                    >
                      How does it work?
                    </Text>
                    <Text
                      color="light_grey"
                      marginBottom="5px"
                      fontSize={'15px'}
                    >
                      {strategy.description}
                    </Text>
                    <Wrap>
                      {getUniqueById(
                        strategy.actions.map((p) => ({
                          id: p.pool.protocol.name,
                          logo: p.pool.protocol.logo,
                        })),
                      ).map((p) => (
                        <WrapItem marginRight={'10px'} key={p.id}>
                          <Center>
                            <Avatar
                              size="2xs"
                              bg={'black'}
                              src={p.logo}
                              marginRight={'2px'}
                            />
                            <Text marginTop={'2px'}>{p.id}</Text>
                          </Center>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                  <Box
                    width={{ base: '100%', md: '20%' }}
                    float={'left'}
                    marginTop={{ base: '10px' }}
                  >
                    <Stat>
                      <StatLabel textAlign={{ base: 'left', md: 'right' }}>
                        APY
                      </StatLabel>
                      <StatNumber
                        color="cyan"
                        textAlign={{ base: 'left', md: 'right' }}
                      >
                        {(strategy.netYield * 100).toFixed(2)}%
                      </StatNumber>
                      <StatHelpText textAlign={{ base: 'left', md: 'right' }}>
                        {strategy.leverage.toFixed(2)}x boosted
                      </StatHelpText>
                    </Stat>
                  </Box>
                </Box>
                <Box
                  padding={'10px'}
                  borderRadius={'10px'}
                  bg={'bg'}
                  color="cyan"
                  marginTop={'20px'}
                >
                  {!balData.isLoading &&
                    !balData.isError &&
                    !balData.isPending &&
                    balData.data &&
                    balData.data.tokenInfo && (
                      <Text>
                        <b>Your Holdings: </b>
                        {address
                          ? `${balData.data.amount.toEtherToFixedDecimals(4)} ${balData.data.tokenInfo?.name}`
                          : isMobile
                            ? CONSTANTS.MOBILE_MSG
                            : 'Connect wallet'}
                      </Text>
                    )}
                  {(balData.isLoading ||
                    balData.isPending ||
                    !balData.data?.tokenInfo) && (
                    <Text>
                      <b>Your Holdings: </b>
                      {address ? (
                        <Spinner size="sm" marginTop={'5px'} />
                      ) : isMobile ? (
                        CONSTANTS.MOBILE_MSG
                      ) : (
                        'Connect wallet'
                      )}
                    </Text>
                  )}
                  {balData.isError && (
                    <Text>
                      <b>Your Holdings: Error</b>
                    </Text>
                  )}
                </Box>
              </Card>
            </GridItem>
            <GridItem display="flex" colSpan={colSpan2}>
              <Card width="100%" padding={'15px'} color="white" bg="highlight">
                <Tabs position="relative" variant="unstyled" width={'100%'}>
                  <TabList>
                    <Tab
                      color="light_grey"
                      _selected={{ color: 'purple' }}
                      onClick={() => {
                        // mixpanel.track('All pools clicked')
                      }}
                    >
                      Deposit
                    </Tab>
                    <Tab
                      color="light_grey"
                      _selected={{ color: 'purple' }}
                      onClick={() => {
                        // mixpanel.track('Strategies opened')
                      }}
                    >
                      Withdraw
                    </Tab>
                  </TabList>
                  <TabIndicator
                    mt="-1.5px"
                    height="2px"
                    bg="purple"
                    color="color1"
                    borderRadius="1px"
                  />
                  <TabPanels>
                    <TabPanel
                      bg="highlight"
                      float={'left'}
                      width={'100%'}
                      padding={'10px 0'}
                    >
                      <Deposit
                        strategy={strategy}
                        buttonText="Deposit"
                        callsInfo={strategy.depositMethods}
                      />
                    </TabPanel>
                    <TabPanel
                      bg="highlight"
                      width={'100%'}
                      float={'left'}
                      padding={'10px 0'}
                    >
                      <Deposit
                        strategy={strategy}
                        buttonText="Redeem"
                        callsInfo={strategy.withdrawMethods}
                      />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Card>
            </GridItem>
          </Grid>
          <Card width={'100%'} color="white" bg="highlight" padding={'15px'}>
            <Text fontSize={'20px'} marginBottom={'0px'} fontWeight={'bold'}>
              Behind the scenes
            </Text>
            <Text fontSize={'15px'} marginBottom={'10px'}>
              Actions done automatically by the strategy (smart-contract) with
              an investment of $1000
            </Text>
            <Flex
              color="white"
              width={'100%'}
              className="text-cell"
              display={{ base: 'none', md: 'flex' }}
            >
              <Text width={'50%'} padding={'5px 10px'}>
                Action
              </Text>
              <Text width={'30%'} textAlign={'left'} padding={'5px 10px'}>
                Protocol
              </Text>
              <Text width={'10%'} textAlign={'right'} padding={'5px 10px'}>
                Amount
              </Text>
              <Text width={'10%'} textAlign={'right'} padding={'5px 10px'}>
                Yield
              </Text>
            </Flex>
            {strategy.actions.map((action, index) => (
              <Box
                className="text-cell"
                display={{ base: 'block', md: 'flex' }}
                key={index}
                width={'100%'}
                color="light_grey"
                fontSize={'14px'}
              >
                <Text width={{ base: '100%', md: '50%' }} padding={'5px 10px'}>
                  {index + 1}
                  {')'} {action.name}
                </Text>
                <Text width={{ base: '100%', md: '30%' }} padding={'5px 10px'}>
                  <Avatar
                    size="2xs"
                    bg={'black'}
                    src={action.pool.pool.logos[0]}
                    marginRight={'2px'}
                  />{' '}
                  {action.pool.pool.name} on
                  <Avatar
                    size="2xs"
                    bg={'black'}
                    src={action.pool.protocol.logo}
                    marginRight={'2px'}
                    marginLeft={'5px'}
                  />{' '}
                  {action.pool.protocol.name}
                </Text>
                <Text
                  display={{ base: 'block', md: 'none' }}
                  width={{ base: '100%', md: '10%' }}
                  padding={'5px 10px'}
                >
                  ${Number(action.amount).toLocaleString()} yields{' '}
                  {action.isDeposit
                    ? (action.pool.apr * 100).toFixed(2)
                    : -(action.pool.borrow.apr * 100).toFixed(2)}
                  %
                </Text>
                <Text
                  display={{ base: 'none', md: 'block' }}
                  width={{ base: '100%', md: '10%' }}
                  textAlign={'right'}
                  padding={'5px 10px'}
                >
                  ${Number(action.amount).toLocaleString()}
                </Text>
                <Text
                  display={{ base: 'none', md: 'block' }}
                  width={{ base: '100%', md: '10%' }}
                  textAlign={'right'}
                  padding={'5px 10px'}
                >
                  {action.isDeposit
                    ? (action.pool.apr * 100).toFixed(2)
                    : -(action.pool.borrow.apr * 100).toFixed(2)}
                  %
                </Text>
              </Box>
            ))}
          </Card>

          {/* Risks card */}
          <Card width={'100%'} color="white" bg="highlight" padding={'15px'}>
            <Text fontSize={'20px'} marginBottom={'10px'} fontWeight={'bold'}>
              Risks
            </Text>
            <OrderedList>
              {strategy.risks.map((r) => (
                <ListItem
                  color="light_grey"
                  key={r}
                  fontSize={'14px'}
                  marginBottom={'5px'}
                >
                  {r}
                </ListItem>
              ))}
            </OrderedList>
          </Card>

          {/* Transaction history card */}
          <Card width={'100%'} color="white" bg="highlight" padding={'15px'}>
            <Text fontSize={'20px'} marginBottom={'10px'} fontWeight={'bold'}>
              Transaction history
            </Text>

            {/* If more than 1 filtered tx */}
            {transactions.filter((tx) => tx.info.strategyId == strategy.id)
              .length > 0 && (
              <>
                <Text
                  fontSize={'14px'}
                  marginBottom={'10px'}
                  color="light_grey"
                >
                  Note: This feature saves and shows transactions made on this
                  device since it was added. Clearing your browser cache will
                  remove this data.
                </Text>

                {transactions
                  .filter((tx) => tx.info.strategyId == strategy.id)
                  .map((tx, index) => {
                    return (
                      <Box
                        className="text-cell"
                        key={index}
                        width={'100%'}
                        color="light_grey"
                        fontSize={'14px'}
                      >
                        <Text width={'100%'} color="white" padding={'5px 10px'}>
                          {/* The default msg contains strategy name, since this for a specific strategy, replace it */}
                          {index + 1}){' '}
                          {StrategyTxPropsToMessageWithStrategies(
                            tx.info,
                            strategies,
                          ).replace(` in ${strategy.name}`, '')}
                        </Text>
                        <Text width={'100%'} padding={'5px 10px'}>
                          {/* The default msg contains strategy name, since this for a specific strategy, replace it */}
                          Transacted on {tx.createdAt.toLocaleDateString()} [
                          <Link
                            textDecoration={'underline'}
                            href={`https://starkscan.co/tx/${tx.txHash}`}
                            target="_blank"
                          >
                            {shortAddress(tx.txHash)}
                          </Link>
                          ]
                        </Text>
                      </Box>
                    );
                  })}
              </>
            )}

            {/* If no filtered tx */}
            {transactions.filter((tx) => tx.info.strategyId == strategy.id)
              .length == 0 && (
              <Text fontSize={'14px'} textAlign={'center'} color="light_grey">
                No transactions recorded since this feature was added. We use
                your {"browser's"} storage to save your transaction history.
                Make a deposit or withdrawal to see your transactions here.
                Clearning browser cache will remove this data.
              </Text>
            )}
          </Card>
        </VStack>
      )}
    </>
  );
};

export default Strategy;
