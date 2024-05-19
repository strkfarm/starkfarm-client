'use client';

import * as React from 'react';

import { sepolia } from '@starknet-react/chains';
import {
  StarknetConfig,
  argent,
  braavos,
  useInjectedConnectors,
  jsonRpcProvider,
} from '@starknet-react/core';
import {
  ChakraBaseProvider,
  extendTheme,
  Flex,
  Center,
  Container,
} from '@chakra-ui/react';
import { Provider as JotaiProvider } from 'jotai';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { RpcProviderOptions, constants } from 'starknet';
import mixpanel from 'mixpanel-browser';

// ! make page view more dynamic
mixpanel.init('118f29da6a372f0ccb6f541079cad56b');

const theme = extendTheme({
  colors: {
    transparent: 'rgba(0, 0, 0, 0)',
    opacity_50p: 'rgba(0, 0, 0, 0.5)',
    color1: 'rgba(86, 118, 254, 1)',
    color1_65p: 'rgba(86, 118, 254, 0.65)',
    color1_50p: 'rgba(86, 118, 254, 0.5)',
    color1_35p: 'rgba(86, 118, 254, 0.35)',
    color1_light: '#bcc9ff80',
    color2: 'rgb(127 73 229)',
    color2_65p: 'rgba(104, 51, 205, 0.65)',
    color2_50p: 'rgba(104, 51, 205, 0.5)',
    highlight: '#272932', // light grey
    light_grey: '#9d9d9d',
    disabled_text: '#818181',
    disabled_bg: '#5f5f5f',
    purple: '#6F4FF2',
    cyan: '#22F3DF',
    bg: '#1A1C26', // dark blue
  },
  fontSizes: {
    large: '50px',
  },
  space: {
    large: '50px',
  },
  sizes: {
    prose: '100%',
  },
  components: {
    MenuItem: {
      bg: 'highlight',
    },
  },
  fonts: {
    heading: `Poppins", 'Trebuchet MS', sans-serif`,
    body: `Poppins", 'Trebuchet MS', sans-serif`,
  },
});

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export default function Template({ children }: { children: React.ReactNode }) {
  const chains = [sepolia];
  const provider = jsonRpcProvider({
    rpc: (chain) => {
      const args: RpcProviderOptions = {
        nodeUrl:
          'https://rpc.nethermind.io/mainnet-juno?apikey=t1HPjhplOyEQpxqVMhpwLGuwmOlbXN0XivWUiPAxIBs0kHVK',
        chainId: constants.StarknetChainId.SN_MAIN,
      };
      return args;
    },
  });
  const { connectors } = useInjectedConnectors({
    // Show these connectors if the user has no connector installed.
    recommended: [braavos(), argent()],
    // Hide recommended connectors if the user has any connector installed.
    includeRecommended: 'onlyIfNoConnectors',
    // Randomize the order of the connectors.
    order: 'alphabetical',
  });

  function getIconNode(icon: typeof import('*.svg'), alt: string) {
    return (
      <Center className="my-menu-button" width="100%" marginLeft={'-20px'}>
        <Image src={icon} alt={alt} />
      </Center>
    );
  }

  return (
    <JotaiProvider>
      <StarknetConfig
        chains={chains}
        provider={provider}
        connectors={connectors}
      >
        <ChakraBaseProvider theme={theme}>
          <Flex minHeight={'100vh'} bgColor={'#020612'}>
            {/* <Sidebar collapsed={true} backgroundColor='var(--chakra-colors-highlight)' style={{"border": '0px'}} collapsedWidth={'150px'}>
              <Center width='100%' marginTop='20px'><Image src={LogoSvg} alt='Logo' height={'50px'}/></Center>
              <Menu style={{"marginTop": '100px', "backgroundColor": '#eecef9'}}
              >
                <MenuItem>
                  <Box>{getIconNode(HomeSvg, 'home')}</Box>
                </MenuItem>
                <MenuItem active={true}>
                  <Box>{getIconNode(PlaySvg, 'play')}</Box>
                </MenuItem>
                <MenuItem>
                  <Box>{getIconNode(HomeSvg, 'home')}</Box>
                </MenuItem>
              </Menu>
            </Sidebar>
           */}
            <Container
              fontFamily={`"Poppins", 'Trebuchet MS', sans-serif`}
              width={'100%'}
              padding="0px"
              paddingTop="100px"
            >
              <Navbar />
              <React.Suspense>{children}</React.Suspense>
            </Container>
          </Flex>
        </ChakraBaseProvider>
      </StarknetConfig>
    </JotaiProvider>
  );
}
