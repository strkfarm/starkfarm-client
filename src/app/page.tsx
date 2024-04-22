'use client';

import tg from '@/assets/tg.svg';
import Pools from '@/components/Pools';
import Strategies from '@/components/Strategies';
import CONSTANTS from '@/constants';

import {
  Box,
  Center,
  Container,
  Image,
  Link,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import mixpanel from 'mixpanel-browser';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    mixpanel.track('Page open');
  }, []);

  return (
    <Container maxWidth={'1000px'} margin={'0 auto'}>
      <Box padding={'15px 30px'} borderRadius="10px" margin="20px 0px">
        <Text fontSize={'35px'} color={'cyan'} textAlign={'center'}>
          <b>🚀Starknet DeFi Spring</b>
        </Text>
        <Text
          color="color2"
          textAlign={'center'}
          fontSize={'18px'}
          marginBottom={'0px'}
        >
          Identify the best $STRK rewarding pools and maximize your rewards
        </Text>
        {/* <Text color='cyan' textAlign={'center'} fontSize={'18px'} marginBottom={'20px'}>
            Pools: {_filteredPools.length}, pages: {pagesCount}</Text> */}
      </Box>
      <Tabs position="relative" variant="unstyled" width={'100%'}>
        <TabList>
          <Tab
            color="light_grey"
            _selected={{ color: 'color2' }}
            onClick={() => {
              mixpanel.track('All pools clicked');
            }}
          >
            All Pools
          </Tab>
          <Tab
            color="light_grey"
            _selected={{ color: 'color2' }}
            onClick={() => {
              mixpanel.track('Strategies opened');
            }}
          >
            Strategies✨
          </Tab>
        </TabList>
        <TabIndicator
          mt="-1.5px"
          height="2px"
          bg="color2"
          color="color1"
          borderRadius="1px"
        />
        <TabPanels>
          <TabPanel bg="highlight" float={'left'} width={'100%'}>
            <Pools />
          </TabPanel>
          <TabPanel bg="highlight" width={'100%'} float={'left'}>
            <Strategies></Strategies>
          </TabPanel>
        </TabPanels>
      </Tabs>
      <hr
        style={{
          width: '100%',
          borderColor: '#5f5f5f',
          float: 'left',
          margin: '20px 0',
        }}
      />
      <Text color="light_grey" textAlign={'center'} width={'100%'}>
        More features coming soon. Join our Telegram channel to discuss
        strategies, features and contribute.
      </Text>
      <Center padding="10px 0" width={'100%'} float={'left'}>
        <Link href={CONSTANTS.COMMUNITY_TG} isExternal>
          <Image src={tg.src} width="50" margin="0 auto" alt="telegram" />
        </Link>
      </Center>
      <Center width={'100%'} float="left">
        <Box
          width="300px"
          maxWidth={'100%'}
          marginTop={'20px'}
          borderTop={'1px solid var(--chakra-colors-highlight)'}
          textAlign={'center'}
          textColor={'color2'}
          padding="10px 0"
          fontSize={'13px'}
        >
          Made with ❤️ on Starknet by{' '}
          <Link href="https://t.me/akiraonstarknet" target="_blank">
            @akiraonstarknet
          </Link>
        </Box>
      </Center>
    </Container>
  );
}
