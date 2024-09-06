import CONSTANTS from '@/constants';
import { StrategyInfo, strategiesAtom } from '@/store/strategies.atoms';
import { getDisplayCurrencyAmount, getUniqueById } from '@/utils';
import { AddIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Center,
  Container,
  Grid,
  GridItem,
  HStack,
  Heading,
  Icon,
  Image,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
  Stack,
  Text,
  Tooltip,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import React from 'react';
import mixpanel from 'mixpanel-browser';
import TVL from './TVL';
import shield from '@/assets/shield.svg';
import { userStatsAtom } from '@/store/utils.atoms';
import { IStrategyProps, StrategyLiveStatus } from '@/strategies/IStrategy';
import { allPoolsAtomUnSorted } from '@/store/protocols';
import { FaWallet } from 'react-icons/fa';
import HarvestTime from './HarvestTime';

export default function Strategies() {
  const allPools = useAtomValue(allPoolsAtomUnSorted);
  const strategies = useAtomValue(strategiesAtom);
  const { data: userData } = useAtomValue(userStatsAtom);

  function getStratCardBg(strat: IStrategyProps, index: number) {
    if (
      strat.liveStatus == StrategyLiveStatus.ACTIVE ||
      strat.liveStatus == StrategyLiveStatus.NEW
    ) {
      return index % 2 === 0 ? 'color1_50p' : 'color2_50p';
    }
    return 'bg';
  }

  function getStratCardBgHover(strat: IStrategyProps, index: number) {
    if (strat.liveStatus == StrategyLiveStatus.ACTIVE) {
      return index % 2 === 0 ? 'color1_65p' : 'color2_65p';
    }
    return 'bg';
  }

  function getStratCardBadgeBg(strat: IStrategyProps) {
    if (strat.liveStatus === StrategyLiveStatus.NEW) {
      return 'cyan';
    } else if (strat.liveStatus === StrategyLiveStatus.COMING_SOON) {
      return 'yellow';
    }
    return 'bg';
  }

  function DepositButton(strat: StrategyInfo) {
    // const { isOpen, onOpen, onClose } = useDisclosure()
    return (
      <Box>
        <Avatar size="xs" src={strat.holdingTokens[0].logo} />
        <Box
          float={'left'}
          marginTop={{ base: '7px', md: '15px' }}
          width={{ base: 'calc(100% - 40px)', md: 'calc(100% - 80px)' }}
          opacity={'0.5'}
          fontSize={'15px'}
        >
          {strat.description}
        </Box>
        <Popover>
          <PopoverTrigger>
            <Button
              variant={'solid'}
              size={'sm'}
              bg="highlight"
              color="cyan"
              float={'right'}
              marginTop={'10px'}
              _hover={{
                backgroundColor: 'bg',
              }}
              onClick={() => {
                mixpanel.track('Click one click deposit', { name: strat.name });
              }}
            >
              <AddIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent bg="highlight" borderColor={'highlight'}>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverBody marginTop={'20px'}>
              <Text fontSize={'14px'}>
                Thanks for showing interest in{' '}
                <b>`One Click Deposit` feature</b>. We are developing this as
                you read this message and will be available soon. The button is
                to let you know that we will be supporting this soon. 😎
              </Text>

              <Text fontSize={'14px'} color="light_grey" marginTop={'10px'}>
                <b>
                  Join our Telegram group to get instant updates. Link on the
                  top.
                </b>
              </Text>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Box>
    );
  }

  function GetRiskLevel(riskFactor: number) {
    let color = '';
    let bgColor = '';
    let count = 0;
    let tooltipLabel = '';

    if (riskFactor <= 2) {
      color = 'rgba(131, 241, 77, 1)';
      bgColor = 'rgba(131, 241, 77, 0.3)';
      count = 1;
      tooltipLabel = 'Low risk';
    } else if (riskFactor < 4) {
      color = 'rgba(255, 146, 0, 1)';
      bgColor = 'rgba(255, 146, 0, 0.3)';
      count = 3;
      tooltipLabel = 'Medium risk';
    } else {
      color = 'rgba(255, 32, 32, 1)';
      bgColor = 'rgba(255, 32, 32, 0.3)';
      count = 5;
      tooltipLabel = 'High risk';
    }

    return (
      <Box
        width="100%"
        display="flex"
        justifyContent={'flex-end'}
        alignContent={'flex-end'}
      >
        <Tooltip hasArrow label={tooltipLabel} bg="gray.300" color="black">
          <Box
            marginTop={{ base: '10px', md: '0px' }}
            position={'relative'}
            display={'flex'}
            flexDirection={'column'}
            alignSelf={{ base: 'left', md: 'center' }}
            justifyContent={'flex-start'}
          >
            <Box
              width={'100%'}
              display="flex"
              alignItems="center"
              justifyContent={{ base: 'flex-start', md: 'center' }}
              padding={'4px'}
              height={'100%'}
              position={'relative'}
            >
              <Stack direction="row" spacing={1}>
                {[...Array(5)].map((_, index) => (
                  <Box
                    key={index}
                    width="4px"
                    height="18px"
                    borderRadius="md"
                    bg={index < count ? color : '#29335C'}
                  />
                ))}
              </Stack>
            </Box>
            <Box
              position={'absolute'}
              backgroundColor={bgColor}
              opacity={0.3}
              filter={'blur(30.549999237060547px)'}
              right={{ base: '-50', md: '-37px' }}
              bottom={'-80px'}
              width={'94px'}
              height={'94px'}
              zIndex={0}
            />
          </Box>
        </Tooltip>
      </Box>
    );
  }

  function getStrategyWiseInfo(id: string) {
    const amount = userData?.strategyWise.find((item) => item.id === id);
    return amount?.usdValue ? amount?.usdValue : 0;
  }

  function StrategyCard(props: { strat: StrategyInfo }) {
    const { strat } = props;
    const tvlInfo = useAtomValue(props.strat.tvlAtom);

    return (
      <Grid
        width={'100%'}
        templateRows="repeat(6, 1fr)"
        templateColumns="repeat(10, 1fr)"
      >
        {/* Strategy name, logo and protocols */}
        <GridItem colSpan={{ base: 7, md: 4 }} rowSpan={{ base: 6, md: 6 }}>
          <Box width={'100%'}>
            <Box>
              <HStack
                fontSize={{ base: '25px', md: '25px' }}
                textAlign={'left'}
                marginBottom={'5px'}
                alignItems={'center'}
                spacing={'8px'}
                borderRadius={'4px'}
              >
                <Avatar size={'xs'} src={strat.holdingTokens[0].logo} />
                <Heading size="xs" marginTop={'2px'}>
                  {strat.name}
                </Heading>
                {strat.liveStatus != StrategyLiveStatus.ACTIVE && (
                  <Badge
                    ml="1"
                    bg={getStratCardBadgeBg(strat)}
                    fontFamily={'sans-serif'}
                    padding="2px 8px"
                    textTransform="capitalize"
                    fontWeight={500}
                  >
                    {strat.liveStatus.valueOf()}
                  </Badge>
                )}
                {strat.isLive() && (
                  <Tooltip label="Audited smart contract. Click to view the audit report.">
                    <Link href={CONSTANTS.AUDIT_REPORT} target="_blank">
                      <Box
                        width={'24px'}
                        height={'24px'}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        backgroundColor={'rgba(0, 0, 0, 0.2)'}
                        borderRadius={'50%'}
                      >
                        <Image src={shield.src} alt="badge" />
                      </Box>
                    </Link>
                  </Tooltip>
                )}
              </HStack>
              <Heading
                fontSize={{ base: '12px', md: '14px' }}
                color="grey_text"
                marginTop="12px"
              >
                <Wrap>
                  {getUniqueById(
                    strat.actions.map((p) => ({
                      id: p.pool.protocol.name,
                      logo: p.pool.protocol.logo,
                    })),
                  ).map((p) => (
                    <WrapItem marginRight={'2px'} key={p.id}>
                      <Center>
                        <Avatar
                          size="2xs"
                          bg={'black'}
                          src={p.logo}
                          marginRight={'6px'}
                        />
                        <Text marginTop={'2px'} color="grey_text">
                          {p.id}
                        </Text>
                      </Center>
                    </WrapItem>
                  ))}
                </Wrap>
              </Heading>
            </Box>
          </Box>
        </GridItem>

        {/* APY, boost */}
        <GridItem colSpan={{ base: 3, md: 2 }} rowSpan={{ base: 4, md: 6 }}>
          <Box
            width={'100%'}
            display="flex"
            flexDirection={'column'}
            textAlign={'left'}
            alignItems={{ base: 'flex-end', md: 'flex-end' }}
            justifyContent="center"
          >
            <Box width={'100%'} marginBottom={'5px'}>
              <Tooltip label="Includes fees & rewards earning potential">
                <Text textAlign={'right'} color="#fff" fontWeight={600}>
                  {(strat.netYield * 100).toFixed(2)}%
                </Text>
              </Tooltip>
            </Box>
            <Tooltip label="Shows the increased capital efficiency of investments compared to direct deposit in popular lending protocols">
              <Box display={'flex'} justifyContent={'flex-end'}>
                <Text color="#FCC01E">⚡</Text>
                <Text width="100%" color="cyan" fontWeight={600}>
                  {strat.leverage.toFixed(1)}X
                </Text>
              </Box>
            </Tooltip>
          </Box>
        </GridItem>

        {/* Risk factor */}
        <GridItem
          colSpan={{ base: 3, md: 2 }}
          rowSpan={{ base: 3, md: 6 }}
          display={{ base: 'none', md: 'block' }}
        >
          {GetRiskLevel(strat.riskFactor)}
        </GridItem>

        {/* TVL, my deposits */}
        <GridItem colSpan={{ base: 10, md: 2 }} rowSpan={{ base: 2, md: 6 }}>
          <Box
            width={'100%'}
            textAlign={'right'}
            fontWeight={600}
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'center'}
            alignItems={'flex-end'}
          >
            {strat.isLive() && (
              <Text>
                ${getDisplayCurrencyAmount(tvlInfo.data?.usdValue || 0, 0)}
              </Text>
            )}
            {!strat.isLive() && <Text>-</Text>}
            {strat.isLive() && (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                marginTop={'5px'}
                borderRadius={'20px'}
                color="grey_text"
                fontSize={'12px'}
              >
                <>
                  <Tooltip label="Your deposits">
                    <Text width={'100%'} textAlign={'right'} fontWeight={600}>
                      <Icon
                        as={FaWallet}
                        marginRight={'5px'}
                        marginTop={'-2px'}
                      />
                      $
                      {Math.round(
                        getStrategyWiseInfo(strat.id),
                      ).toLocaleString()}
                    </Text>
                  </Tooltip>
                </>
              </Box>
            )}
          </Box>
        </GridItem>
      </Grid>
    );
  }

  return (
    <Container width="100%" float={'left'} padding={'0px'} marginTop={'10px'}>
      <TVL />

      <HarvestTime />

      <Text
        marginTop={'15px'}
        color="light_grey"
        fontSize={'15px'}
        marginBottom={'15px'}
      >
        <b>What are strategies?</b> Strategies are combination of investment
        steps that combine various pools and risk combinations to maximize
        yield.
      </Text>

      <Card variant={'filled'} bg="opacity_50p" color={'purple'}>
        <CardBody paddingTop={'5px'} paddingBottom={'5px'}>
          <Grid templateRows="repeat(6, 1fr)" templateColumns="repeat(10, 1fr)">
            <GridItem colSpan={{ base: 7, md: 4 }} rowSpan={{ base: 6, md: 6 }}>
              <Heading size={{ base: 'xs', md: 'md' }} textAlign="left">
                Strategy
              </Heading>
            </GridItem>
            <GridItem colSpan={{ base: 3, md: 2 }} rowSpan={{ base: 4, md: 6 }}>
              <Heading size={{ base: 'xs', md: 'md' }} textAlign="right">
                APY & Boost
              </Heading>
            </GridItem>
            <GridItem
              colSpan={{ base: 3, md: 2 }}
              rowSpan={{ base: 3, md: 6 }}
              display={{ base: 'none', md: 'block' }}
            >
              <Heading size={{ base: 'xs', md: 'md' }} textAlign="right">
                Risk
              </Heading>
            </GridItem>
            <GridItem
              colSpan={{ base: 10, md: 2 }}
              rowSpan={{ base: 2, md: 6 }}
            >
              <Heading size={{ base: 'xs', md: 'md' }} textAlign="right">
                TVL ($)
              </Heading>
            </GridItem>
          </Grid>
        </CardBody>
      </Card>
      {allPools.length && strategies.length > 0 && (
        <Stack spacing="4">
          {strategies.map((strat, index) => (
            <Card
              key={`${strat.name}`}
              variant={'filled'}
              bg={getStratCardBg(strat, index)}
              borderRadius={'4px'}
              color="white"
              minHeight={'100px'}
              _hover={getStratCardBgHover(strat, index)}
            >
              <CardBody
                padding={{ base: '15px', md: '20px' }}
                overflowY={'hidden'}
              >
                <Box
                  width={'100%'}
                  pointerEvents={strat.isLive() ? 'auto' : 'none'}
                >
                  <Link
                    _active={{
                      textDecoration: 'none !important',
                    }}
                    _hover={{
                      textDecoration: 'none !important',
                    }}
                    href={`/strategy/${strat.id}`}
                  >
                    <StrategyCard strat={strat} />
                  </Link>
                </Box>
                {/* {DepositButton(strat)} */}
              </CardBody>
            </Card>
          ))}
        </Stack>
      )}
      {allPools.length > 0 && strategies.length === 0 && (
        <Box padding="10px 0" width={'100%'} float={'left'}>
          <Text color="light_grey" textAlign={'center'}>
            No strategies. Check back soon.
          </Text>
        </Box>
      )}
      {allPools.length === 0 && (
        <Stack>
          <Skeleton height="70px" />
          <Skeleton height="70px" />
          <Skeleton height="70px" />
          <Skeleton height="70px" />
        </Stack>
      )}
      <Text
        color="color2"
        textAlign={'center'}
        width={'100%'}
        margin="15px 0"
        fontSize="18px"
      >
        More strategies coming soon. Join our{' '}
        <Link textDecoration={'underline'} href={CONSTANTS.COMMUNITY_TG}>
          Telegram channel
        </Link>{' '}
        to stay upto date.
      </Text>
    </Container>
  );
}
