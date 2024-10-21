'use client';

import {
  Box,
  Container,
  Skeleton,
  Stack,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo, useState } from 'react';
import {
  Pagination,
  PaginationContainer,
  usePagination,
  PaginationNext,
  PaginationPrevious,
  PaginationPage,
  PaginationPageGroup,
} from '@ajna/pagination';
import { CategoryFilters, ProtocolFilters } from '@/components/Filters';
import {
  allPoolsAtomUnSorted,
  filteredPools,
  sortAtom,
} from '@/store/protocols';
import YieldCard, { HeaderSorter } from './YieldCard';

export default function Pools() {
  const allPools = useAtomValue(allPoolsAtomUnSorted);
  const _filteredPools = useAtomValue(filteredPools);
  const ITEMS_PER_PAGE = 15;
  // set sort atom declared
  const setSort = useSetAtom(sortAtom);
  // get current sort atom
  const sort = useAtomValue(sortAtom);
  // declare react states for apr,risk,tvl to manage active? states
  const [aprStatus, setAprStatus] = useState(false);
  const [riskStatus, setRiskStatus] = useState(false);
  const [tvlStatus, setTvlStatus] = useState(false);
  const { currentPage, setCurrentPage, pagesCount, pages } = usePagination({
    pagesCount: Math.floor(_filteredPools.length / ITEMS_PER_PAGE) + 1,
    initialState: { currentPage: 1 },
  });

  const pools = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return _filteredPools.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [_filteredPools, currentPage, sort]);

  // handle sort click function
  const handleSortChange = (field: string) => (order: 'asc' | 'desc') => {
    // if RISK is click
    if (field === 'RISK') {
      setRiskStatus(true);
      // check if risk exists in sort atom
      const riskIndex = sort.findIndex((s) => s.field === 'RISK');
      // if risk exist update the order else set risk with selected order
      if (riskIndex >= 0) {
        setSort((prev) => {
          const updatedSort = prev.filter((s) => s.field !== 'RISK');
          return [
            ...updatedSort,
            { field, order: sort[riskIndex].order == 'desc' ? 'asc' : 'desc' },
          ];
        });
      } else {
        setSort((prev) => {
          const updatedSort = prev.filter((s) => s.field !== field);
          return [...updatedSort, { field, order: 'asc' }];
        });
      }
    } else if (field == 'APR' || field == 'TVL') {
      // if APR or TVL is clicked clear sort atom, check if exist in sort atom if exist then set order else clear sort atom and set
      setRiskStatus(false);
      const new_sort: any = [];
      if (field == 'APR') {
        setTvlStatus(false);
        setAprStatus(true);
      }
      if (field == 'TVL') {
        setTvlStatus(true);
        setAprStatus(false);
      }
      const currentFieldIndex = sort.findIndex((s) => s.field === field);
      new_sort.push({
        field,
        order:
          sort[currentFieldIndex]?.order &&
          sort[currentFieldIndex]?.order == 'desc'
            ? 'asc'
            : 'desc',
      });
      setSort([]);
      setSort(new_sort);
    }
  };
  return (
    <Box float="left" width={'100%'}>
      <ProtocolFilters />
      <Box width={'100%'} marginTop={'10px'}>
        <Box width={{ base: '100%', md: '70%' }} float={'left'}>
          <CategoryFilters />
        </Box>
        <Container
          float={'left'}
          padding="0px"
          width={{ base: '100%', md: '30%' }}
        >
          <Pagination
            pagesCount={pagesCount}
            currentPage={currentPage}
            isDisabled={false}
            onPageChange={(page) => {
              setCurrentPage(page);
            }}
          >
            <PaginationContainer align="right" float={'right'} p={4}>
              <PaginationPrevious
                marginRight="4px"
                bg="highlight"
                color="purple"
              >
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
                    color="purple"
                  />
                ))}
              </PaginationPageGroup>
              <PaginationNext marginLeft="4px" bg="highlight" color="purple">
                <Text>{'>'}</Text>
              </PaginationNext>
            </PaginationContainer>
          </Pagination>
        </Container>
      </Box>

      <Container width="100%" float={'left'} padding={'0px'} marginTop={'10px'}>
        <Table variant="simple">
          <Thead display={{ base: 'none', md: 'table-header-group' }}>
            <Tr fontSize={'18px'} color={'white'} bg="bg">
              <Th>Pool name</Th>
              <Th textAlign={'right'}>
                <HeaderSorter
                  heading="APY"
                  mainColor="color2Text"
                  inActiveColor="#d9d9f726"
                  onClick={handleSortChange('APR')}
                  active={aprStatus}
                />
              </Th>
              <Th textAlign={'right'}>
                <HeaderSorter
                  heading="Risk"
                  mainColor="color2Text"
                  inActiveColor="#d9d9f726"
                  onClick={handleSortChange('RISK')}
                  active={riskStatus}
                />
              </Th>
              <Th textAlign={'right'}>
                <HeaderSorter
                  heading="TVL"
                  mainColor="color2Text"
                  inActiveColor="#d9d9f726"
                  onClick={handleSortChange('TVL')}
                  active={tvlStatus}
                />
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {allPools.length > 0 && (
              <>
                {pools.map((pool, index) => {
                  return (
                    <YieldCard
                      key={pool.pool.id}
                      pool={pool}
                      index={index}
                      showProtocolName={true}
                    />
                  );
                })}
              </>
            )}
          </Tbody>
        </Table>
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
