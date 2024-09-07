import CONSTANTS from '@/constants';
import { strategiesAtom } from '@/store/strategies.atoms';
import {
  Box,
  Container,
  Link,
  Skeleton,
  Stack,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import React, { useMemo } from 'react';
import { userStatsAtom } from '@/store/utils.atoms';
import { allPoolsAtomUnSorted, filteredPools } from '@/store/protocols';
import { addressAtom } from '@/store/claims.atoms';
import { usePagination } from '@ajna/pagination';
import { YieldStrategyCard } from './YieldCard';
export default function Strategies() {
  const allPools = useAtomValue(allPoolsAtomUnSorted);
  const strategies = useAtomValue(strategiesAtom);
  const { data: userData } = useAtomValue(userStatsAtom);
  const address = useAtomValue(addressAtom);

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

  return (
    <Container width="100%" float={'left'} padding={'0px'} marginTop={'0px'}>
      <Text color="color2Text" fontSize={'15px'}>
        <b>What are strategies?</b>
      </Text>
      <Text color="color2Text" fontSize={'15px'} marginBottom={'15px'}>
        Strategies are a combination of investment steps that combine various
        pools to maximize yield.
      </Text>
      <Table variant="simple">
        <Thead display={{ base: 'none', md: 'table-header-group' }}>
          <Tr fontSize={'18px'} color={'white'} bg="bg">
            <Th>Strategy name</Th>
            <Th textAlign={'right'}>APY</Th>
            <Th textAlign={'right'}>Risk</Th>
            <Th textAlign={'right'}>TVL</Th>
          </Tr>
        </Thead>
        <Tbody>
          {allPools.length > 0 && strategies.length > 0 && (
            <>
              {strategies.map((strat, index) => {
                return (
                  <YieldStrategyCard
                    key={strat.id}
                    strat={strat}
                    index={index}
                  />
                );
              })}
            </>
          )}
        </Tbody>
      </Table>
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
