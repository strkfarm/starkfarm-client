'use client';

import {
  PoolInfo,
  allPoolsAtomUnSorted,
  filteredPools,
  sortPoolsAtom,
} from '@/store/pools';
import {
  Avatar,
  AvatarGroup,
  Box,
  Card,
  CardBody,
  Container,
  Flex,
  HStack,
  Heading,
  LinkOverlay,
  Skeleton,
  Spinner,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { useEffect, useMemo } from 'react';
import {
  Pagination,
  PaginationContainer,
  usePagination,
  PaginationNext,
  PaginationPrevious,
  PaginationPage,
  PaginationPageGroup,
} from '@ajna/pagination';
import Filters from '@/components/Filters';
import CardHeading from './CardHeader';

export default function Pools() {
  const allPools = useAtomValue(allPoolsAtomUnSorted);
  const _filteredPools = useAtomValue(filteredPools);
  const ITEMS_PER_PAGE = 15;
  const { currentPage, setCurrentPage, pagesCount, pages } = usePagination({
    pagesCount: Math.floor(_filteredPools.length / ITEMS_PER_PAGE) + 1,
    initialState: { currentPage: 1 },
  });

  const pools = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return _filteredPools.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [_filteredPools, currentPage]);

  const sortedPools = useAtomValue(sortPoolsAtom);

  useEffect(() => {
    console.log('sortedPools', sortedPools);
  }, [sortedPools]);
  useEffect(() => {
    console.log('pages', currentPage, setCurrentPage, pagesCount, pages);
  }, [currentPage, setCurrentPage, pagesCount, pages]);

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
                {split.title}{' '}
                {split.description ? `(${split.description})` : ''}
              </Text>
              <Text fontSize={'xs'} width={'30%'} textAlign={'right'} key="2">
                {split.apr === 'Err' ? split.apr : (split.apr * 100).toFixed(2)}
                %
              </Text>
            </Flex>
          );
        })}
      </Box>
    );
    return (
      <Tooltip
        hasArrow
        label={tip}
        bg="gray.300"
        color="black"
        fontFamily={'Inter'}
      >
        <Box
          width={{ base: 'auto', md: '50%' }}
          marginRight={'0px'}
          marginLeft={{ base: 'auto', md: '0px' }}
          display={'flex'}
        >
          {pool.isLoading && <Spinner />}
          {!pool.isLoading && (
            <>
              <Text
                textAlign={{ base: 'left', md: 'center' }}
                color="#fff"
                fontSize={'14px'}
                marginTop={{ base: '10px', md: '0' }}
              >
                {(pool.apr * 100).toFixed(2)}%
              </Text>
            </>
          )}
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box float="left" width={'100%'}>
      <Filters />
      {
        <Container width={'100%'} float={'left'} padding="0px">
          <Pagination
            pagesCount={pagesCount}
            currentPage={currentPage}
            isDisabled={false}
            onPageChange={(page) => {
              setCurrentPage(page);
            }}
          >
            <PaginationContainer align="right" float={'right'} p={4}>
              <PaginationPrevious marginRight="4px" bg="highlight" color="cyan">
                <Text>{'<'}</Text>
              </PaginationPrevious>
              <PaginationPageGroup>
                {pages.map((page: number) => (
                  <PaginationPage
                    key={`pagination_page_${page}`}
                    page={page}
                    padding={'2px 10px'}
                    isDisabled={page === currentPage}
                    bg="highlight"
                    color="cyan"
                  />
                ))}
              </PaginationPageGroup>
              <PaginationNext marginLeft="4px" bg="highlight" color="cyan">
                <Text>{'>'}</Text>
              </PaginationNext>
            </PaginationContainer>
          </Pagination>
        </Container>
      }

      <Container width="100%" float={'left'} padding={'0px'} marginTop={'10px'}>
        <Card variant={'filled'} bg="opacity_50p" color={'purple'}>
          <CardBody paddingTop={'5px'} paddingBottom={'5px'}>
            <HStack width={'100%'}>
              <Heading width={{ base: '50%', md: '33%' }} size="md">
                Pool
              </Heading>
              <Stack
                direction={{ base: 'column', md: 'row' }}
                width={{ base: '50%', md: '66%' }}
              >
                <Heading
                  width={{ base: '100%', md: '50%' }}
                  size="md"
                  textAlign={{ base: 'right', md: 'center' }}
                >
                  STRK APY(%)
                </Heading>
                <Heading
                  width={{ base: '100%', md: '50%' }}
                  size="sm"
                  textAlign={'right'}
                >
                  TVL($)
                </Heading>
              </Stack>
            </HStack>
          </CardBody>
        </Card>
        {pools.length > 0 && (
          <Stack spacing="4" position={'relative'}>
            {pools.map((pool, index) => (
              <Card
                key={`${pool.pool.name}_${pool.protocol.name}`}
                variant={'filled'}
                borderRadius={'4px'}
                textStyle="custom"
                overflowY={'hidden'}
                bg={index % 2 === 0 ? 'color1_50p' : 'color2_50p'}
                color="white"
              >
                <CardBody
                  padding={{ base: '15px', md: '20px 32px' }}
                  minHeight={'100px'}
                  display={'flex'}
                  alignItems={'center'}
                >
                  <Stack
                    direction={{ base: 'column', md: 'row' }}
                    width={'100%'}
                    alignItems={{ base: 'flex-start', md: 'center' }}
                  >
                    <Box
                      width={{ base: '100%', md: '40%' }}
                      position={'relative'}
                    >
                      <LinkOverlay
                        href={pool.protocol.link}
                        width={'100%'}
                        borderWidth={'0px'}
                        target="_blank"
                      >
                        <Flex alignItems={'center'}>
                          <AvatarGroup size="xs" max={2} marginRight={'10px'}>
                            {pool.pool.logos.map((logo) => (
                              <Avatar key={logo} src={logo} />
                            ))}
                          </AvatarGroup>
                          <CardHeading size="xs">{pool.pool.name}</CardHeading>
                        </Flex>
                        <CardHeading
                          size="xs"
                          marginTop={'12px'}
                          color="color1_light"
                          display={'flex'}
                        >
                          <Avatar
                            size="2xs"
                            bg={'black'}
                            name="Dan Abrahmov"
                            src={pool.protocol.logo}
                            marginRight={'6px'}
                          />
                          <Text fontWeight={300} color="grey_text">
                            {pool.protocol.name}
                          </Text>
                        </CardHeading>
                      </LinkOverlay>
                    </Box>
                    <Box width={{ base: '50%', md: '20%' }}>
                      {getAPRWithToolTip(pool)}
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
                      {GetRiskLevel(pool.pool.name)}
                    </Box>
                    <Text
                      width={{ base: '100%', md: '23%' }}
                      textAlign={'right'}
                    >
                      ${Math.round(pool.tvl).toLocaleString()}
                    </Text>
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </Stack>
        )}
        {allPools.length > 0 && pools.length === 0 && (
          <Box padding="10px 0" width={'100%'} float={'left'}>
            <Text color="light_grey" textAlign={'center'}>
              No pools. Check filters.
            </Text>
          </Box>
        )}
        {allPools.length === 0 && (
          <Stack>
            <Skeleton height="70px" />
            <Skeleton height="70px" />
            <Skeleton height="70px" />
          </Stack>
        )}
      </Container>
    </Box>
  );
}
