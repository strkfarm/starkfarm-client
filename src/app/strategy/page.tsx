'use client';

import Deposit from '@/components/Deposit';
import CONSTANTS from '@/constants';
import { DUMMY_BAL_ATOM } from '@/store/balance.atoms';

import { StrategyInfo, strategiesAtom } from '@/store/strategies.atoms';
import {
  StrategyTxPropsToMessageWithStrategies,
  transactionsAtom,
} from '@/store/transactions.atom';
import { getUniqueById, shortAddress } from '@/utils';
import MyNumber from '@/utils/MyNumber';
  Avatar,
  Box,
  Card,
  Center,
  Container,
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
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { isMobile } from 'react-device-detect';

export default function Strategy() {
  const { address } = useAccount();
  const searchParams = useSearchParams();
  const strategies = useAtomValue(strategiesAtom);
  const transactions = useAtomValue(transactionsAtom);

  useEffect(() => {
    console.log('txs', transactions);
  }, [transactions]);
  const strategy: StrategyInfo | undefined = useMemo(() => {
    const name = searchParams.get('name');
    console.log('name', name);
    return strategies.find((s) => s.name === name);
  }, [searchParams, strategies]);

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

  const balance = useMemo(() => {
    return balData.data?.amount || MyNumber.fromZero();
  }, [balData]);

  useEffect(() => {
    mixpanel.track('Strategy page open', { name: searchParams.get('name') });
  }, [searchParams]);

  const colSpan1: any = { base: '5', md: '3' };
  const colSpan2: any = { base: '5', md: '2' };
  return (
    <Container
      maxWidth={'1000px'}
      margin={'0 auto'}
      padding="30px 10px"
      fontFamily={'sans-serif'}
    >
      <Flex marginBottom={'10px'}>
        <Avatar marginRight={'5px'} src={strategy?.holdingTokens[0].logo} />
        <Text
          marginTop={'6px'}
          color="white"
          fontSize={{ base: '18px', md: '25px' }}
          fontWeight={'bold'}
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
            <GridItem display="grid" colSpan={colSpan2}>
            <Card
                width="100%"
                padding="15px"
                marginBottom="8px"
                color="white"
                bg="highlight"
              >
                <Stat>
                  <StatLabel
                    color="light_grey"
                    marginBottom={'8px'}
                    fontSize={'16px'}
                    textAlign={{ base: 'left', md: 'right' }}
                  >
                    Potential yield
                  </StatLabel>
                  <StatNumber
                    color="light_grey"
                    fontSize="medium"
                    textAlign={{ base: 'left', md: 'right' }}
                  >
                    <Avatar
                      marginRight="5px"
                      width="20px"
                      height="20px"
                      src={strategy?.holdingTokens[0]?.logo}
                    />
                    {balData.isLoading ||
                    balData.isPending ||
                    !balData.data?.tokenInfo ? (
                      <Spinner size="xs" marginTop="5px" />
                    ) : (
                      new Intl.NumberFormat('en-US').format(
                        strategy.netYield *
                          Number(balance.toEtherToFixedDecimals(4)),
                      )
                    )}
                  </StatNumber>
                </Stat>
              </Card>
              <Card width="100%" padding={'15px'} color="white" bg="highlight">
                <Tabs position="relative" variant="unstyled" width={'100%'}>
                  <TabList>
                    <Tab
                      color="light_grey"
                      _selected={{ color: 'color2Text' }}
                      onClick={() => {
                        // mixpanel.track('All pools clicked')
                      }}
                    >
                      Deposit
                    </Tab>
                    <Tab
                      color="light_grey"
                      _selected={{ color: 'color2Text' }}
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
                    bg="color2Text"
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
              This is what happens when you invest $1000 in this strategy:
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
    </Container>
  );
}
