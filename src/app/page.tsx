'use client';

import tg from '@/assets/tg.svg';
import { useDotButton } from '@/components/EmblaCarouselDotButton';
import Pools from '@/components/Pools';
import Strategies from '@/components/Strategies';
import CONSTANTS from '@/constants';

import {
  Box,
  Center,
  Image as ChakraImage,
  Container,
  Link,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import mixpanel from 'mixpanel-browser';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  useEffect(() => {
    mixpanel.track('Page open');
  }, []);

  const searchParams = useSearchParams();
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    const tab = searchParams.get('tab');
    console.log('tab', tab);
    if (tab === 'pools') {
      setTabIndex(1);
    } else {
      setTabIndex(0);
    }
  }, [searchParams]);

  const router = useRouter();

  function setRoute(value: string) {
    router.push(`?tab=${value}`);
  }

  function handleTabsChange(index: number) {
    if (index === 1) {
      setRoute('pools');
    } else {
      setRoute('strategies');
    }
  }

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
    },
    [Autoplay({ playOnInit: true, delay: 8000 })]
  );

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);

  return (
    <Container maxWidth={'1000px'} margin={'0 auto'}>
      <Box padding={'15px 30px'} borderRadius="10px" margin="20px 0px">
        <Text fontSize={'35px'} color={'cyan'} textAlign={'center'}>
          <b>{"Starknet's"} Yield Powerhouse🚀</b>
        </Text>
        <Text
          color="color2"
          textAlign={'center'}
          fontSize={'18px'}
          marginBottom={'0px'}
        >
          Identify & Invest in the best $STRK rewarding pools and maximize your
          rewards
        </Text>
      </Box>

       <Box className="embla" ref={emblaRef}>
        <Box className="embla__container">
          <Box className="embla__slide" position="relative" height={'150px'}>
            <Image
              src="/banner1.svg"
              alt="Degen Mode"
              fill
              style={{ objectFit: 'cover', borderRadius: '8px' }}
            />
          </Box>

          <Box className="embla__slide" position="relative" height={'150px'}>
            <Image
              src="/banner2.svg"
              alt="CCP Program"
              fill
              style={{ objectFit: 'cover', borderRadius: '8px' }}
            />
          </Box>
        </Box>
      </Box>

       <Box
        display="grid"
        justifyContent="center"
        gap="1.2rem"
        mb="1.5rem"
      >
        <Box
          display="flex"
          flexWrap="wrap"
          justifyContent="flex-end"
          alignItems="center"
          marginRight="calc((2.6rem - 1.4rem) / 2 * -1)"
          gap=".5rem"
        >
          {scrollSnaps.map((_, index) => (
            <Box
              key={index}
              onClick={() => onDotButtonClick(index)}
              width="0.8rem"
              height="0.8rem"
              borderRadius="50%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              backgroundColor={index === selectedIndex ? '#4D59E8' : 'black'}
              padding="0"
              margin="0"
              border="1px solid #373A5D"
              textDecoration="none"
              appearance="none"
              // boxShadow={
              //   index === selectedIndex ? 'inset 0 0 0 0.2rem #4D59E8' : ''
              // }
            />
          ))}
        </Box>
      </Box>

      <Tabs
        position="relative"
        variant="unstyled"
        width={'100%'}
        index={tabIndex}
        onChange={handleTabsChange}
      >
        <TabList>
          <Tab
            color="light_grey"
            _selected={{ color: 'color2Text' }}
            onClick={() => {
              mixpanel.track('Strategies opened');
            }}
          >
            Strategies✨
          </Tab>
          <Tab
            color="light_grey"
            _selected={{ color: 'color2Text' }}
            onClick={() => {
              mixpanel.track('All pools clicked');
            }}
          >
            Find yields
          </Tab>
        </TabList>
        <TabIndicator
          mt="-1.5px"
          height="2px"
          bg="color2Text"
          color="color1"
          borderRadius="1px"
        />
        <TabPanels>
          <TabPanel bg="highlight" width={'100%'} float={'left'}>
            <Strategies></Strategies>
          </TabPanel>
          <TabPanel bg="highlight" float={'left'} width={'100%'}>
            <Pools />
          </TabPanel>
        </TabPanels>
      </Tabs>
      {/* <hr style={{width: '100%', borderColor: '#5f5f5f', float: 'left', margin: '20px 0'}}/> */}
      <Center padding="10px 0" width={'100%'} float={'left'}>
        <Link href={CONSTANTS.COMMUNITY_TG} isExternal>
          <ChakraImage src={tg.src} width="50" margin="0 auto" />
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
          Made with ❤️ on Starknet
        </Box>
      </Center>
    </Container>
  );
}
