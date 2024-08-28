import { allPoolsAtomUnSorted } from '@/store/pools';
import { StrategyInfo, strategiesAtom } from '@/store/strategies.atoms';
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
import React from 'react';
import mixpanel from 'mixpanel-browser';
import TVL from './TVL';
import CONSTANTS from '@/constants';
import { IStrategyProps, StrategyLiveStatus } from '@/strategies/IStrategy';
import CardHeading from './CardHeader';

export default function Strategies() {
  const allPools = useAtomValue(allPoolsAtomUnSorted);
  const strategies = useAtomValue(strategiesAtom);

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
      strat.liveStatus == StrategyLiveStatus.ACTIVE ||
      strat.liveStatus == StrategyLiveStatus.NEW
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
          <Tooltip
            hasArrow
            label={tooltipLabel}
            bg="gray.300"
            color="black"
            fontFamily={'Inter'}
          >
            <Box
              width={'100%'}
              display="flex"
              alignItems="center"
              justifyContent={{ base: 'flex-start', md: 'center' }}
              padding={'4px'}
              height={'100%'}
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
          </Tooltip>
        </Box>
        <Box
          position={'absolute'}
          backgroundColor={color}
          opacity={0.3}
          filter={'blur(30.549999237060547px)'}
          right={{ base: '70%', md: '18px' }}
          bottom={'-80px'}
          width={'94px'}
          height={'94px'}
          zIndex={0}
        />
      </>
    );
  }

  function getStratCard(strat: StrategyInfo) {
    return (
      <Stack direction={{ base: 'column', md: 'row' }} width={'100%'}>
        <LinkBox
          width={{ base: '100%', md: '45%' }}
          display={{ base: 'flex', md: 'flex' }}
          onClick={() => {
            mixpanel.track('Strategy expanded', { name: strat.name });
          }}
        >
          <Box width={'100%'}>
            <Box>
              <LinkOverlay
                href={isLive(strat) ? `/strategy?id=${strat.id}` : '#'}
                cursor={isLive(strat) ? 'pointer' : 'default'}
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
                  <CardHeading fontSize="xs" fontWeight={600} marginTop={'2px'}>
                    {strat.name}
                  </CardHeading>
                  {strat.liveStatus != StrategyLiveStatus.ACTIVE && (
                    <Badge
                      ml="1"
                      bg="cyan"
                      fontFamily={'sans-serif'}
                      padding="2px 8px"
                      textTransform="capitalize"
                      fontWeight={500}
                    >
                      {strat.liveStatus.valueOf()}
                    </Badge>
                  )}
                </HStack>
              </LinkOverlay>
              <CardHeading
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
                        <Text
                          marginTop={'2px'}
                          fontWeight={300}
                          color="grey_text"
                        >
                          {p.id}
                        </Text>
                      </Center>
                    </WrapItem>
                  ))}
                </Wrap>
              </CardHeading>
            </Box>
          </Box>
        </LinkBox>
        <Box
          width={{ base: '100%', md: '20%' }}
          marginTop={{ base: '10px', md: '0px' }}
          display="flex"
          flexDirection={'column'}
          textAlign={'left'}
          alignItems="center"
          justifyContent="center"
        >
          <Box width={'100%'} float="left" marginBottom={'5px'}>
            <Tooltip label="Includes fees & rewards earn from tokens shown">
              <Text textAlign={'left'} color="#fff" fontWeight={600}>
                {(strat.netYield * 100).toFixed(2)}%
              </Text>
            </Tooltip>
          </Box>
          <Tooltip label="Multiplier showing the additional reward earned compared to simple deposit">
            <Text width="100%" color="cyan" fontWeight={600}>
              ⚡️{strat.leverage.toFixed(1)}X
            </Text>
          </Tooltip>
        </Box>
        <Box
          width={{ base: '50%', md: '15%' }}
          marginTop={{ base: '10px', md: '0px' }}
          position={'relative'}
          display={'flex'}
          flexDirection={'column'}
          alignItems={{ base: 'left', md: 'center' }}
          justifyContent={'flex-start'}
        >
          <Text
            fontSize={'14px'}
            marginBottom={{ base: '10px', md: '16px' }}
            fontWeight={600}
          >
            Safety Score
          </Text>
          {GetRiskLevel(strat.name)}
        </Box>
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
      <Card
        variant={'filled'}
        bg="opacity_50p"
        color={'purple'}
        display={{ base: 'none', md: 'visible' }}
      >
        <CardBody paddingTop={'5px'} paddingBottom={'5px'}>
          <HStack width={'100%'}>
            <Heading width={{ base: '70%' }} size="md">
              Strategy
            </Heading>
            <Stack direction={{ base: 'column' }} width={{ base: '30%' }}>
              <Heading width={{ base: '100%' }} size="sm" textAlign={'right'}>
                APR(%)/Leverage
              </Heading>
            </Stack>
          </HStack>
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
              textStyle="custom"
              minHeight={'100px'}
              _hover={getStratCardBgHover(strat, index)}
            >
              <CardBody
                padding={{ base: '15px', md: '20px 32px' }}
                overflowY={'hidden'}
              >
                <Box
                  width={'100%'}
                  padding={'0px 10px 0 0'}
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
}
