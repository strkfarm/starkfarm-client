'use client';

import { Hero } from '@/components/Hero';
import Pools from '@/components/Pools';
import emoji from 'react-easy-emoji';
import Strategies from '@/components/Strategies';

import {
  Container,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import mixpanel from 'mixpanel-browser';
import { useEffect } from 'react';
import { Footer } from '@/components/Footer';
import { Calculator } from '@/components/Calculator';

export default function Home() {
  useEffect(() => {
    mixpanel.track('Page open');
  }, []);

  return (
    <Container maxWidth={'1000px'} margin={'0 auto'}>
      <Hero />
      <Tabs position="relative" variant="unstyled" width={'100%'}>
        <TabList>
          <Tab
            color="light_grey"
            fontWeight={500}
            _selected={{ color: 'color2' }}
            onClick={() => {
              mixpanel.track('All pools clicked');
            }}
          >
            All Pools
          </Tab>
          <Tab
            color="light_grey"
            fontWeight={500}
            _selected={{ color: 'color2' }}
            onClick={() => {
              mixpanel.track('Strategies opened');
            }}
          >
            Strategies {emoji('✨')}
          </Tab>
          <Tab
            color="light_grey"
            fontWeight={500}
            _selected={{ color: 'color2' }}
            onClick={() => {
              mixpanel.track('Calculator opened');
            }}
          >
            Calculator
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
          <TabPanel bg="transparent" float={'left'} width={'100%'}>
            <Pools />
          </TabPanel>
          <TabPanel bg="transparent" width={'100%'} float={'left'}>
            <Strategies />
          </TabPanel>
          <TabPanel bg="transparent" width={'100%'} float={'left'}>
            <Calculator />
          </TabPanel>
        </TabPanels>
      </Tabs>
      <Footer />
    </Container>
  );
}
