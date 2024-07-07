'use client';

import {
  Center,
  ChakraBaseProvider,
  Container,
  Flex,
  extendTheme,
} from '@chakra-ui/react';
import { mainnet } from '@starknet-react/chains';
import { StarknetConfig, jsonRpcProvider } from '@starknet-react/core';
import { Provider as JotaiProvider } from 'jotai';
import mixpanel from 'mixpanel-browser';
import Image from 'next/image';
import * as React from 'react';
import { RpcProviderOptions, constants } from 'starknet';
import { ArgentMobileConnector } from 'starknetkit/argentMobile';
import { InjectedConnector } from 'starknetkit/injected';

import Navbar from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';

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
    color2Text: 'rgb(165 118 255)',
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
    heading: `'Courier New', Courier, monospace`,
    body: `'Courier New', Courier, monospace`,
  },
});

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export const CONNECTOR_NAMES = ['Braavos', 'Argent X', 'Argent (mobile)']; // 'Argent Web Wallet'];
export const MYCONNECTORS = [
  new InjectedConnector({ options: { id: 'braavos', name: 'Braavos' } }),
  new InjectedConnector({ options: { id: 'argentX', name: 'Argent X' } }),
  new ArgentMobileConnector(),
  // new WebWalletConnector({ url: 'https://web.argent.xyz' }),
];

export default function Template({ children }: { children: React.ReactNode }) {
  const chains = [mainnet];
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
        connectors={MYCONNECTORS}
      >
        <ChakraBaseProvider theme={theme}>
          <Flex minHeight={'100vh'} bgColor={'bg'}>
            <Container width={'100%'} padding="0px" paddingTop="100px">
              <Navbar />
              <React.Suspense>{children}</React.Suspense>
              <Toaster />
            </Container>
          </Flex>
        </ChakraBaseProvider>
      </StarknetConfig>
    </JotaiProvider>
  );
}
