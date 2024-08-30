import CONSTANTS from '@/constants';
import { allPoolsAtomUnSorted } from '@/store/pools';
import { StrategyInfo, strategiesAtom } from '@/store/strategies.atoms';
import { IStrategyProps, StrategyLiveStatus } from '@/strategies/IStrategy';
import { getUniqueById } from '@/utils';
import { AddIcon } from '@chakra-ui/icons';
import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Center,
  Container,
  HStack,
  Heading,
  Image,
  Link,
  LinkBox,
  LinkOverlay,
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
import mixpanel from 'mixpanel-browser';
import React from 'react';
import TVL from './TVL';
import CONSTANTS from '@/constants';
import { IStrategyProps, StrategyLiveStatus } from '@/strategies/IStrategy';
import shield from '@/assets/shield.svg';
import { userStatsAtom } from '@/store/utils.atoms';


const Strategies: React.FC = () => {
  const allPools = useAtomValue(allPoolsAtomUnSorted);
  const strategies = useAtomValue(strategiesAtom);
  const { data: userData, isPending: userStatsPending } =
    useAtomValue(userStatsAtom);

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
        <AvatarGroup
          size="xs"
          max={4}
          marginRight={'5px'}
          float={'left'}
          visibility={'hidden'}
          display={{ base: 'none', md: 'flex' }}
        >
          {getUniqueById(
            strat.actions.map((p) => ({
              id: p.pool.pool.name,
              logo: p.pool.pool.logos[0],
            })),
          ).map((p: any) => (
            <Avatar key={p.id} src={p.logo} />
          ))}
        </AvatarGroup>
        <Box
          float={'left'}
          marginTop={{ base: '7px', md: '15px' }}
          width={{ base: 'calc(100% - 40px)', md: 'calc(100% - 80px)' }}
          opacity={'0.5'}
          fontSize={'15px'}
          fontFamily={'arial'}
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

  function isLive(strat: StrategyInfo) {
    return (
      strat.liveStatus === StrategyLiveStatus.ACTIVE ||
      strat.liveStatus === StrategyLiveStatus.NEW
    );
  }

  function GetRiskLevel(poolName: string) {
    let color = '';
    let count = 0;
    let tooltipLabel = '';
    const checkToken = (tokens: string[]) => {
      const regex = new RegExp(tokens.join('|'), 'i');
      return regex.test(poolName.toLowerCase());
    };

    if (checkToken(['eth', 'strk'])) {
      color = '#FF9200';
      count = 3;
      tooltipLabel = 'Medium risk';
    } else if (checkToken(['usdt', 'usdc'])) {
      color = '#83F14D';
      count = 5;
      tooltipLabel = 'Low risk';
    } else {
      color = '#FF2020';
      count = 1;
      tooltipLabel = 'High risk';
    }

    return (
      <>
        <Box>
          <Tooltip hasArrow label={tooltipLabel} bg="gray.300" color="black">
            <Box
              width={{ base: '50%', md: '40%' }}
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
                backgroundColor={color}
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
      </>
    );
  }

  function getStrategyWiseInfo(id: string) {
    const amount = userData?.strategyWise.find((item) => item.id === id);
    return amount?.usdValue ? amount?.usdValue : 0;
  }

  function getStratCard(strat: StrategyInfo) {
    return (
      <Stack
        width={'100%'}
        direction={{ base: 'column', md: 'row' }}
        alignItems={{ base: 'flex-start', md: 'center' }}
        justifyContent={'space-between'}
      >
        <HStack
          width={{ base: '100%', md: '60%' }}
          alignItems={{ base: 'flex-start', md: 'center' }}
        >
          <LinkBox
            width={{ base: '100%', md: '70%' }}
            display={{ base: 'flex', md: 'flex' }}
            onClick={() => {
              mixpanel.track('Strategy expanded', { name: strat.name });
            }}
          >
          <Box width={'100%'}>
            <Box>
              <LinkOverlay
                href={isLive(strat) ? `/strategy/${strat.id}` : '#'}
                cursor={isLive(strat) ? 'pointer' : 'default'}
              >
                <HStack
                  fontSize={{ base: '25px', md: '25px' }}
                  textAlign={'left'}
                  marginBottom={'5px'}
                  fontWeight={'bold'}
                  alignItems={'center'}

                >
                  <HStack
                    fontSize={{ base: '25px', md: '25px' }}
                    textAlign={'left'}
                    marginBottom={'5px'}
                    alignItems={'center'}
                    spacing={'8px'}
                    borderRadius={'4px'}
                  >
                    <AvatarGroup
                      size="xs"
                      max={4}
                      marginRight={'5px'}
                      float={'right'}
                    >
                      {getUniqueById(
                        strat.actions.map((p) => ({
                          id: p.pool.pool.name,
                          logo: p.pool.pool.logos[0],
                        })),
                      ).map((p: any) => (
                        <Avatar key={p.id} src={p.logo} />
                      ))}
                    </AvatarGroup>
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
                    {isLive(strat) && (
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
                    )}
                  </HStack>
                </LinkOverlay>
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
          </LinkBox>
          <Box
            width={{ base: '50%', md: '20%' }}
            display="flex"
            flexDirection={'column'}
            textAlign={'left'}
            alignItems={{ base: 'flex-end', md: 'flex-start' }}
            justifyContent="center"
          >
            <Box width={'100%'} marginBottom={'5px'}>
              <Tooltip label="Includes fees & rewards earn from tokens shown">
                <Text
                  textAlign={{ base: 'right', md: 'left' }}
                  color="#fff"
                  fontWeight={600}
                >
                  {(strat.netYield * 100).toFixed(2)}%
                </Text>
              </Tooltip>
            </Box>
            <Tooltip label="Multiplier showing the additional reward earned compared to simple deposit">
              <Box display={'flex'} justifyContent={'flex-start'}>
                <Text color="#FCC01E">⚡</Text>
                <Text width="100%" color="cyan" fontWeight={600}>
                  {strat.leverage.toFixed(1)}X
                </Text>
              </Box>
            </Tooltip>
          </Box>
        </HStack>
        <HStack
          width={{ base: '100%', md: '30%' }}
          alignItems={{ base: 'flex-start', md: 'center' }}
          justifyContent={'space-between'}
        >
          {GetRiskLevel(strat.name)}
          <Box
            width={{ base: '50%', md: '60%' }}
            textAlign={'right'}
            fontWeight={600}
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'center'}
            alignItems={'flex-end'}
          >
            <Text>0</Text>
            {getStrategyWiseInfo(strat.id) !== 0 && (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                backgroundColor={'rgba(0, 0, 0, 0.2)'}
                padding="4px 10px"
                borderRadius={'20px'}
                color="grey_text"
                fontSize={'12px'}
              >
                <>
                  <Text width={'100%'} textAlign={'right'} fontWeight={600}>
                    Your deposits $
                    {Math.round(getStrategyWiseInfo(strat.id)).toLocaleString()}
                  </Text>
                </>
              </Box>
            )}
          </Box>
        </HStack>
        {/* <Stack direction={{base: 'column', md: 'row'}} width={{base: '50%', md: '66%'}}>
            {getAPRWithToolTip(pool)}
            <Text width={{base: '100%', md: '50%'}} textAlign={'right'}>${Math.round(pool.tvl).toLocaleString()}</Text>
            </Stack> */}
      </Stack>
    );
  }

  return (
    <Container width="100%" float={'left'} padding={'0px'} marginTop={'10px'}>
      <TVL />
      <Text
        marginTop={'15px'}
        color="light_grey"
        fontSize={'15px'}
        marginBottom={'15px'}
        fontFamily={'arial'}
      >
        <b>What are strategies?</b> Strategies are combination of investment
        steps that combine various pools and risk combinations to maximize
        yield. We currently have one High yield low risk strategy, and adding
        more as you read this.
      </Text>
      <Card variant={'filled'} bg="opacity_50p" color={'purple'}>
        <CardBody paddingTop={'5px'} paddingBottom={'5px'}>
          <Stack
            width={'100%'}
            direction={{ base: 'column', md: 'row' }}
            alignItems={{ base: 'flex-start', md: 'center' }}
            justifyContent={'space-between'}
          >
            <HStack
              width={{ base: '100%', md: '55%' }}
              alignItems={{ base: 'flex-start', md: 'center' }}
            >
              <Heading width={{ base: '50%', md: '70%' }} size="md">
                Strategy Name
              </Heading>
              <Heading
                width={{ base: '50%', md: '33%' }}
                size="md"
                textAlign={{ base: 'right', md: 'center' }}
              >
                APY/Leverage
              </Heading>
            </HStack>
            <HStack
              width={{ base: '100%', md: '40%' }}
              alignItems={{ base: 'flex-start', md: 'center' }}
            >
              <Heading
                width={{ base: '70%', md: '50%' }}
                size="md"
                textAlign={{ base: 'left', md: 'center' }}
              >
                SAFETY SCORE
              </Heading>
              <Heading
                width={{ base: '30%', md: '50%' }}
                size="sm"
                textAlign={'right'}
              >
                TVL($)
              </Heading>
            </HStack>
          </Stack>
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
                padding={{ base: '15px', md: '20px 32px' }}
                overflowY={'hidden'}
              >
                <Box
                  width={'100%'}
                  pointerEvents={isLive(strat) ? 'auto' : 'none'}
                >
                  {getStratCard(strat)}
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
        color="color2Text"
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
};

export default Strategies;
