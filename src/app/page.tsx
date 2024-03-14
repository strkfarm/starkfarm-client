'use client';

import Navbar from "@/components/Navbar";
import EkuboAtoms from "@/store/ekobu.store";
import Ekubo from "@/store/ekobu.store";
import Jediswap from "@/store/jedi.store";
import { PoolInfo, StrkDexIncentivesAtom, allPools } from "@/store/pools";
import { Avatar, Box, Card, CardBody, CardHeader, Container, Flex, HStack, Heading, Skeleton, Stack, Text } from "@chakra-ui/react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import useSWR from 'swr'

const poolsAtom = atom((get) => {
  // const poolsInfo = get(StrkDexIncentivesAtom)
  const empty: PoolInfo[] = [];
  return 1;
  // else return 2;
})

export default function Home() {
  const pools = useAtomValue(allPools);

  return (
    <Container maxWidth={'800px'} margin={'0 auto'}>
        <Text color='white'>Total pools: {pools.length}</Text>
        <Card variant={'filled'} bg='opacity_50p' color={'purple'}>
          <CardBody paddingTop={'5px'} paddingBottom={'5px'}>
            <HStack width={'100%'}>
                <Heading width={'33%'} size='md'>Pool</Heading>
                <Heading width={'33%'} size='md' textAlign={'center'}>APR (%)</Heading>
                <Heading width={'33%'} size='md' textAlign={'right'}>TVL ($)</Heading>
            </HStack>
          </CardBody>
        </Card>
        {pools.length > 0 && <Stack spacing='4'>
          {pools.map((pool, index) => (
            <Card key={`${pool.name}_${pool.protocol.name}`} variant={'filled'} bg={index % 2 == 0 ? 'color1_50p': 'color2_50p'} color='white'>
              <CardBody>
                <HStack width={'100%'}>
                    <Box width={'33%'}>
                      <Heading size='md'> {pool.name}</Heading>
                      <Heading size='xs'> 
                        <Avatar size='2xs' name='Dan Abrahmov' src={pool.protocol.logo} marginRight={'2px'} />
                        {pool.protocol.name}
                      </Heading>
                    </Box>
                    <Text width={'33%'} textAlign={'center'}>{(pool.apr * 100).toFixed(2)}%</Text>
                    <Text width={'33%'} textAlign={'right'}>${Math.round(pool.tvl).toLocaleString()}</Text>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </Stack>}
        {pools.length == 0 && <Stack>
          <Skeleton height='70px' />
          <Skeleton height='70px' />
          <Skeleton height='70px' />
        </Stack>}
    </Container>
  );
}
