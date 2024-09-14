'use client';

import { NextPage } from 'next';
import React, { useEffect, useMemo } from 'react';
import x from '@/assets/x.svg';
import illustration from '@/assets/illustration.svg';
import NFTAbi from '../../abi/nft.abi.json';

import {
  Box,
  Button,
  Image as ChakraImage,
  Container,
  Link,
  Text,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { atomWithQuery } from 'jotai-tanstack-query';
import { addressAtom } from '@/store/claims.atoms';
import { useAtomValue } from 'jotai';
import {
  useContractRead,
  useContractWrite,
  useProvider,
} from '@starknet-react/core';
import { Contract } from 'starknet';

interface CommunityPage {}

interface OGNFTUserData {
  address: string;
  hash: string;
  isOgNFTUser: boolean;
  sig: string[];
  totalOgNFTUsers: number;
}
const isOGNFTEligibleAtom = atomWithQuery((get) => {
  return {
    queryKey: ['isOGNFTEligibleAtom'],
    queryFn: async ({ queryKey }: any): Promise<OGNFTUserData | null> => {
      const address = get(addressAtom);
      if (!address) return null;
      const data = await fetch(`/api/users/ognft/${address}`);
      return data.json();
    },
    refetchInterval: 5000,
  };
});

const CommunityPage: NextPage<CommunityPage> = () => {
  const isOGNFTEligible = useAtomValue(isOGNFTEligibleAtom);
  const address = useAtomValue(addressAtom);
  const { provider } = useProvider();
  const isOGNFTLoading = useMemo(() => {
    return isOGNFTEligible.isLoading || isOGNFTEligible.isError;
  }, [isOGNFTEligible.isLoading, isOGNFTEligible.isError]);

  const ogNFTContract = new Contract(
    NFTAbi,
    process.env.NEXT_PUBLIC_OG_NFT_CONTRACT || '',
    provider,
  );
  const { writeAsync: claimOGNFT } = useContractWrite({
    calls: [
      ogNFTContract.populate('mint', {
        nftId: 1,
        rewardEarned: 0,
        hash: isOGNFTEligible.data?.hash || '0',
        signature: isOGNFTEligible.data?.sig || [],
      }),
    ],
  });

  const { data: ogNFTBalance } = useContractRead({
    abi: NFTAbi,
    address: process.env.NEXT_PUBLIC_OG_NFT_CONTRACT || '0',
    functionName: 'balanceOf',
    args: [address || '0x0'],
  });

  useEffect(() => {
    console.log('ogNFTBalance', ogNFTBalance);
    console.log('isOGNFTEligible', isOGNFTEligible);
  }, [ogNFTBalance, isOGNFTEligible]);

  return (
    <Container maxWidth="1000px" margin="0 auto" padding="30px 10px">
      <Box
        display="flex"
        flexDirection={{ base: 'column', md: 'row' }}
        gap={{ base: '20px' }}
        margin="40px 0px"
      >
        <Box display="flex" flexDirection="column" gap="20px" flex="2">
          <Text
            fontSize={{ base: '28px', md: '48px' }}
            lineHeight={'48px'}
            textAlign={'left'}
            color={'white'}
          >
            <b className="">Community Program</b>
          </Text>
          <Text
            width="300px"
            color="white"
            textAlign={'left'}
            fontSize={{ base: '16px', md: '12px' }}
          >
            Earn points to level up and collect NFTs that signal your loyalty.
            These NFTs unlock future rewards and exclusive incentives.
          </Text>

          <Button
            margin="auto auto 0 0"
            variant="outline"
            border="1px"
            borderRadius="5px"
            zIndex={1}
            _before={{
              content: `""`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 'inherit',
              padding: '1.5px',
              background: 'linear-gradient(90deg, #6F4FF2 0%, #61FCAE 100%)',
              WebkitMask:
                'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'destination-out',
              maskComposite: 'exclude',
              zIndex: -1,
            }}
            _hover={{
              bg: 'color2_50p',
            }}
          >
            <Text className="theme-gradient-text">Know more</Text>
          </Button>
        </Box>

        <Box display="flex" flexDirection="column" flex="3" borderRadius="10px">
          <Box display="flex" alignItems="center" justifyContent="center">
            <ChakraImage src={illustration.src} height="200px" />
          </Box>
          <Box>
            <Box display="flex" gap="10px">
              <Box
                position="relative"
                display="flex"
                width="100%"
                justifyContent="space-between"
                alignItems="center"
                padding={{ base: '0px 10px', md: '0px 10px' }}
                border="1px"
                borderRadius="5px"
                zIndex={1}
                _before={{
                  content: `""`,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 'inherit',
                  padding: '1.5px',
                  background:
                    'linear-gradient(90deg, #6F4FF2 0%, #61FCAE 100%)',
                  WebkitMask:
                    'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'destination-out',
                  maskComposite: 'exclude',
                  zIndex: -1,
                }}
              >
                <Text color="white" fontSize={{ base: '8px', md: '12px' }}>
                  https://strkfarm.xyz/?referralCode+undefined&refer....
                </Text>
                <Button
                  background="transparent"
                  border="none"
                  color="#87F9D5"
                  fontSize={{ base: '8px', md: '10px' }}
                  _hover={{
                    bg: 'transparent',
                  }}
                >
                  Copy link
                </Button>
              </Box>
              <Link
                href=""
                display="flex"
                alignItems="center"
                padding={{ base: '5px', md: '10px' }}
                border="2px"
                borderColor="#61FCAE"
                borderRadius="5px"
                _hover={{
                  bg: 'color2_50p',
                }}
              >
                <ChakraImage src={x.src} height="25px" />
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        gap="10px"
        padding="10px 20px"
        className="theme-gradient"
        borderRadius="10px"
      >
        <Text color="white">
          <b>Your Stats</b>
        </Text>
        <Flex
          position="relative"
          width="100%"
          justifyContent="space-between"
          alignItems="center"
          padding="10px 15px"
          border="none"
          borderRadius="5px"
          zIndex={1}
          _before={{
            content: `""`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 'inherit',
            padding: '1.5px',
            background: 'linear-gradient(90deg, #61FCAE 0%, #6F4FF2 100%)',
            WebkitMask:
              'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'destination-out',
            maskComposite: 'exclude',
            zIndex: -1,
          }}
        >
          <Text
            color="white"
            fontSize={{ base: '14px', md: '16px' }}
            width={'40%'}
          >
            Coming soon
          </Text>
          <Box>
            <ChakraImage
              width={'150px'}
              src="https://defispring.starknet.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fnft1.6e2c09ab.png&w=1080&q=75"
            />
            <Button
              onClick={() => claimOGNFT()}
              isDisabled={!isOGNFTEligible.data?.isOgNFTUser}
            >
              {isOGNFTLoading ? <Spinner /> : <></>} Claim
            </Button>
            <Text as="pre">
              Debug info: | isOGNFTEligible:{' '}
              {isOGNFTEligible.data?.isOgNFTUser ? 'true' : 'false'} |
              totalOgNFTUsers: {isOGNFTEligible.data?.totalOgNFTUsers} | sig:{' '}
              {JSON.stringify(isOGNFTEligible.data?.sig)}
            </Text>
          </Box>
        </Flex>
        <Text color="white" fontSize={{ base: '14px', md: '12px' }}>
          You will be able to check your points and claim your NFTs here soon.
        </Text>
      </Box>
    </Container>
  );
};

export default CommunityPage;
