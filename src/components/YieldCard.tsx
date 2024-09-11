import CONSTANTS from '@/constants';
import { PoolInfo } from '@/store/pools';
import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Image,
  Link,
  Spinner,
  Stack,
  Td,
  Text,
  Tooltip,
  Tr,
  VStack,
} from '@chakra-ui/react';
import shield from '@/assets/shield.svg';
import { IStrategyProps, StrategyLiveStatus } from '@/strategies/IStrategy';
import { useAtomValue } from 'jotai';
import { getDisplayCurrencyAmount } from '@/utils';
import { addressAtom } from '@/store/claims.atoms';
import { FaWallet } from 'react-icons/fa';
import { UserStats, userStatsAtom } from '@/store/utils.atoms';
import { getPoolInfoFromStrategy } from '@/store/protocols';
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import mixpanel from 'mixpanel-browser';
import { IStrategy } from '@/strategies/IStrategy';

interface YieldCardProps {
  pool: PoolInfo;
  index: number;
  showProtocolName?: boolean;
}

function getStratCardBg(status: StrategyLiveStatus, index: number) {
  if (status == StrategyLiveStatus.ACTIVE || status == StrategyLiveStatus.NEW) {
    return index % 2 === 0 ? 'color1_50p' : 'color2_50p';
  }
  return 'bg';
}

function getStratCardBadgeBg(status: StrategyLiveStatus) {
  if (status === StrategyLiveStatus.NEW) {
    return 'cyan';
  } else if (status === StrategyLiveStatus.COMING_SOON) {
    return 'yellow';
  }
  return 'bg';
}

function StrategyInfo(props: YieldCardProps) {
  const { pool } = props;
  return (
    <Box>
      <HStack spacing={2}>
        <AvatarGroup size="xs" max={2} marginRight={'10px'}>
          {pool.pool.logos.map((logo) => (
            <Avatar key={logo} src={logo} />
          ))}
        </AvatarGroup>
        <Box>
          <HStack spacing={2}>
            <Heading size="sm" marginTop={'2px'}>
              {pool.pool.name}
            </Heading>
            {pool.additional &&
              pool.additional.tags
                .filter((tag) => tag != StrategyLiveStatus.ACTIVE)
                .map((tag) => {
                  return (
                    <Badge
                      ml="1"
                      bg={getStratCardBadgeBg(tag)}
                      fontFamily={'sans-serif'}
                      padding="2px 8px"
                      textTransform="capitalize"
                      fontWeight={500}
                      key={tag}
                    >
                      {tag}
                    </Badge>
                  );
                })}
            ;
            {pool.additional && pool.additional.isAudited && (
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
          {props.showProtocolName && (
            <HStack marginTop={'5px'} spacing={1}>
              <Avatar size={'2xs'} src={pool.protocol.logo} />
              <Heading size="xs" marginTop={'2px'} color={'light_grey'}>
                {pool.protocol.name}
              </Heading>
            </HStack>
          )}
        </Box>
      </HStack>
    </Box>
  );
}

function getAPRWithToolTip(pool: PoolInfo) {
  const tip = (
    <Box width={'300px'}>
      {pool.aprSplits.map((split) => {
        if (split.apr === 0) {
          return (
            <Text key={split.title}>
              {split.title}: {split.description}
            </Text>
          );
        }
        return (
          <Flex width={'100%'} key={split.title}>
            <Text key="1" width={'70%'}>
              {split.title} {split.description ? `(${split.description})` : ''}
            </Text>
            <Text fontSize={'xs'} width={'30%'} textAlign={'right'} key="2">
              {split.apr === 'Err' ? split.apr : (split.apr * 100).toFixed(2)}%
            </Text>
          </Flex>
        );
      })}
      <Text fontSize={'xs'} fontWeight={'bold'} mt={2}>
        Includes 10% fee on harvested amount
      </Text>
    </Box>
  );

  const effectiveYield =
    pool.strategy instanceof IStrategy
      ? pool.strategy.calculateEffectiveYield(100)
      : pool.apr;

  return (
    <Tooltip hasArrow label={tip} bg="gray.300" color="black">
      <Box
        width={'100%'}
        marginRight={'0px'}
        marginLeft={'auto'}
        display={'flex'}
        justifyContent={'flex-end'}
      >
        {pool.isLoading && <Spinner />}
        {!pool.isLoading && (
          <>
            <Text
              textAlign={'right'}
              color="white"
              fontSize={'16px'}
              fontWeight={'bolder'}
            >
              {(effectiveYield * 100).toFixed(2)}%
            </Text>
          </>
        )}
      </Box>
    </Tooltip>
  );
}

function StrategyAPY(props: YieldCardProps) {
  const { pool } = props;
  return (
    <Box width={'100%'} marginBottom={'5px'}>
      {getAPRWithToolTip(pool)}
      {pool.additional && pool.additional.leverage && (
        <Tooltip label="Shows the increased capital efficiency of investments compared to direct deposit in popular lending protocols">
          <Box width={'100%'}>
            <Box float={'right'} display={'flex'} fontSize={'13px'}>
              <Text color="#FCC01E" textAlign={'right'}>
                ⚡
              </Text>
              <Text
                width="100%"
                color="cyan"
                textAlign={'right'}
                fontWeight={600}
              >
                {pool.additional.leverage.toFixed(1)}X
              </Text>
            </Box>
          </Box>
        </Tooltip>
      )}
    </Box>
  );
}

function isLive(status: StrategyLiveStatus) {
  return (
    status === StrategyLiveStatus.ACTIVE || status === StrategyLiveStatus.NEW
  );
}

function getStrategyWiseInfo(
  userData: UserStats | null | undefined,
  id: string,
) {
  const amount = userData?.strategyWise.find((item) => item.id === id);
  return amount?.usdValue ? amount?.usdValue : 0;
}

function StrategyTVL(props: YieldCardProps) {
  const { pool } = props;
  const address = useAtomValue(addressAtom);
  const { data: userData } = useAtomValue(userStatsAtom);

  const isPoolLive =
    pool.additional &&
    pool.additional.tags[0] &&
    isLive(pool.additional.tags[0]);
  return (
    <Box
      width={'100%'}
      textAlign={'right'}
      fontWeight={600}
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'center'}
      alignItems={'flex-end'}
    >
      {isPoolLive && (
        <Text fontSize={'16px'}>
          ${getDisplayCurrencyAmount(pool.tvl || 0, 0)}
        </Text>
      )}
      {!isPoolLive && <Text>-</Text>}
      {address && isPoolLive && pool.protocol.name == 'STRKFarm' && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius={'20px'}
          color="grey_text"
          fontSize={'12px'}
        >
          <>
            <Tooltip label="Your deposits in this STRKFarm strategy">
              <Text width={'100%'} textAlign={'right'} fontWeight={600}>
                <Icon as={FaWallet} marginRight={'5px'} marginTop={'-2px'} />$
                {Math.round(
                  getStrategyWiseInfo(userData, pool.pool.id),
                ).toLocaleString()}
              </Text>
            </Tooltip>
          </>
        </Box>
      )}
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
      <Tooltip
        hasArrow
        label={`${tooltipLabel}. We currently assess only impermanent loss risk: stable pairs/pools are low risk, volatile multi-token pools are medium risk. More factors will be added soon.`}
        bg="gray.300"
        color="black"
      >
        <Box
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
            padding={'4px 0px'}
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
                  bg={
                    index < count ? color : 'var(--chakra-colors-opacity_50p)'
                  }
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

function StrategyMobileCard(props: YieldCardProps) {
  const { pool, index } = props;
  return (
    <Grid
      color={'white'}
      bg={getStratCardBg(
        pool.additional?.tags[0] || StrategyLiveStatus.ACTIVE,
        index,
      )}
      templateColumns={'repeat(3, 1fr)'}
      templateRows={
        props.showProtocolName ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)'
      }
      display={{ base: 'grid', md: 'none' }}
      padding={'20px'}
      gap={2}
      borderBottom={'1px solid var(--chakra-colors-bg)'}
      as={'a'}
      {...getLinkProps(pool, props.showProtocolName)}
    >
      <GridItem colSpan={3} rowSpan={props.showProtocolName ? 2 : 1}>
        <StrategyInfo
          pool={pool}
          index={index}
          showProtocolName={props.showProtocolName}
        />
      </GridItem>
      <GridItem colSpan={1} rowSpan={2}>
        <Text
          textAlign={'right'}
          color={'color2'}
          fontWeight={'bold'}
          fontSize={'13px'}
        >
          APY
        </Text>
        <StrategyAPY pool={pool} index={index} />
      </GridItem>
      <GridItem colSpan={1} rowSpan={2}>
        <Text
          textAlign={'right'}
          color={'color2'}
          fontWeight={'bold'}
          fontSize={'13px'}
        >
          RISK
        </Text>
        {pool.additional?.riskFactor
          ? GetRiskLevel(pool.additional?.riskFactor)
          : '-'}
      </GridItem>
      <GridItem colSpan={1} rowSpan={2}>
        <Text
          textAlign={'right'}
          color={'color2'}
          fontWeight={'bold'}
          fontSize={'13px'}
        >
          TVL
        </Text>
        <StrategyTVL pool={pool} index={index} />
      </GridItem>
    </Grid>
  );
}

function getLinkProps(pool: PoolInfo, showProtocolName?: boolean) {
  return {
    href: pool.protocol.link,
    target: '_blank',
    onClick: () => {
      mixpanel.track('Pool clicked', {
        pool: pool.pool.name,
        protocol: pool.protocol.name,
        yield: pool.apr,
        risk: pool.additional.riskFactor,
        tvl: pool.tvl,
        showProtocolName,
      });
    },
  };
}
export default function YieldCard(props: YieldCardProps) {
  const { pool, index } = props;

  return (
    <>
      <Tr
        color={'white'}
        bg={index % 2 == 0 ? 'color1_50p' : 'color2_50p'}
        display={{ base: 'none', md: 'table-row' }}
        as={'a'}
        {...getLinkProps(pool, props.showProtocolName)}
      >
        <Td>
          <StrategyInfo
            pool={pool}
            index={index}
            showProtocolName={props.showProtocolName}
          />
        </Td>
        <Td>
          <StrategyAPY pool={pool} index={index} />
        </Td>
        <Td>
          {pool.additional?.riskFactor
            ? GetRiskLevel(pool.additional?.riskFactor)
            : '-'}
        </Td>
        <Td>
          <StrategyTVL pool={pool} index={index} />
        </Td>
      </Tr>
      <StrategyMobileCard
        pool={pool}
        index={index}
        showProtocolName={props.showProtocolName}
      />
    </>
  );
}

export function YieldStrategyCard(props: {
  strat: IStrategyProps;
  index: number;
}) {
  const tvlInfo = useAtomValue(props.strat.tvlAtom);
  const pool = getPoolInfoFromStrategy(
    props.strat,
    tvlInfo.data?.usdValue || 0,
  );

  return <YieldCard pool={pool} index={props.index} showProtocolName={false} />;
}

export function HeaderSorter(props: {
  heading: string;
  mainColor: string;
  inActiveColor: string;
  onClick: (order: 'asc' | 'desc') => void;
}) {
  const [isAscending, setIsAscending] = useState(false);
  const [isDescending, setIsDescending] = useState(false);

  return (
    <HStack
      as="button"
      onClick={() => {
        let order: 'asc' | 'desc' = 'desc';
        if (!isAscending && !isDescending) {
          setIsDescending(true);
        } else if (isDescending) {
          setIsAscending(true);
          setIsDescending(false);
          order = 'asc';
        } else {
          setIsAscending(false);
          setIsDescending(true);
        }
        props.onClick(order);
      }}
      float={'right'}
    >
      <Text color={props.mainColor}>{props.heading.toUpperCase()}</Text>
      <VStack gap={0} spacing={0}>
        <TriangleUpIcon
          color={isAscending ? props.mainColor : props.inActiveColor}
        />
        <TriangleDownIcon
          color={isDescending ? props.mainColor : props.inActiveColor}
        />
      </VStack>
    </HStack>
  );
}
