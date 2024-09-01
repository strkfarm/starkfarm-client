import CONSTANTS from '@/constants';
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
import { allPoolsAtomUnSorted } from '@/store/protocols';

const Strategies: React.FC = () => {
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

  function getStratCard(strat: StrategyInfo) {
    return (
      <Stack direction={{ base: 'column', md: 'row' }} width={'100%'}>
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
                  <Heading size={{ base: 'sm', md: 'md' }} fontWeight={'bold'}>
                    {strat.name}
                  </Heading>
                  {strat.liveStatus != StrategyLiveStatus.ACTIVE && (
                    <Badge
                      ml="1"
                      bg="cyan"
                      fontFamily={'sans-serif'}
                      padding="3px 5px 2px"
                    >
                      {strat.liveStatus.valueOf()}
                    </Badge>
                  )}
                </HStack>
              </LinkOverlay>
              <Heading
                fontSize={{ base: '12px', md: '14px' }}
                color="color1_light"
              >
                <Wrap>
                  {getUniqueById(
                    strat.actions.map((p) => ({
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
              </Heading>
            </Box>
          </Box>
        </LinkBox>
        <Box
          width={{ base: '100%', md: '30%' }}
          marginTop={{ base: '10px', md: '0px' }}
        >
          <Box width={'100%'} float="left" marginBottom={'5px'}>
            <Tooltip label="Includes fees & rewards earn from tokens shown">
              <Text
                textAlign={'right'}
                color="cyan"
                fontWeight={'bold'}
                float={{ base: 'left', md: 'right' }}
              >
                {(strat.netYield * 100).toFixed(2)}%
              </Text>
            </Tooltip>

            <AvatarGroup size="xs" max={4} marginRight={'5px'} float={'right'}>
              {getUniqueById(
                strat.actions.map((p) => ({
                  id: p.pool.pool.name,
                  logo: p.pool.pool.logos[0],
                })),
              ).map((p: any) => (
                <Avatar key={p.id} src={p.logo} />
              ))}
            </AvatarGroup>
          </Box>
          <Tooltip label="Multiplier showing the additional reward earned compared to simple deposit">
            <Text
              textAlign={{ base: 'left', md: 'right' }}
              width="100%"
              float={'left'}
              color="#eeeeee"
              fontWeight={'bold'}
            >
              {strat.leverage.toFixed(1)}x
            </Text>
          </Tooltip>
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
              color="white"
              _hover={getStratCardBgHover(strat, index)}
            >
              <CardBody padding={{ base: '15px', md: '20px' }}>
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
};

export default Strategies;
