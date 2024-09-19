'use client';

import x from '@/assets/x.svg';
import og_nft from '@/assets/og_nft.jpg';
import illustration from '@/assets/illustration.svg';
import { useAtomValue } from 'jotai';
import { referralCodeAtom } from '@/store/referral.store';
import toast from 'react-hot-toast';
import { getReferralUrl } from '@/utils';
import {
  useContractRead,
  useContractWrite,
  useProvider,
} from '@starknet-react/core';
import { Contract } from 'starknet';
import NFTAbi from '../../abi/nft.abi.json';
import { atomWithQuery } from 'jotai-tanstack-query';
import { addressAtom } from '@/store/claims.atoms';

import {
  Box,
  Button,
  Image as ChakraImage,
  Container,
  Link,
  Progress,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';

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
    queryFn: async ({ _queryKey }: any): Promise<OGNFTUserData | null> => {
      const address = get(addressAtom) || '0x0';
      if (!address) return null;
      const data = await fetch(`/api/users/ognft/${address}`);
      return data.json();
    },
    refetchInterval: 5000,
  };
});

const CommunityPage = () => {
  const [progress, setProgress] = useState(0);
  const [isEligible, setIsEligible] = useState(false);
  const [hasNFT, setHasNFT] = useState(false);
  const [isEligibilityChecked, setIsEligibilityChecked] = useState(false);
  const referralCode = useAtomValue(referralCodeAtom);
  const isOGNFTEligible = useAtomValue(isOGNFTEligibleAtom);
  const address = useAtomValue(addressAtom);
  const { provider } = useProvider();
  const isOGNFTLoading = useMemo(() => {
    return (
      isOGNFTEligible.isLoading ||
      isOGNFTEligible.isFetching ||
      isOGNFTEligible.isError
    );
  }, [
    isOGNFTEligible.isLoading,
    isOGNFTEligible.isFetching,
    isOGNFTEligible.isError,
  ]);

  const ogNFTContract = new Contract(
    NFTAbi,
    process.env.NEXT_PUBLIC_OG_NFT_CONTRACT || '',
    provider,
  );

  const { writeAsync: claimOGNFT } = useContractWrite({
    calls: [
      ogNFTContract.populate('mint', {
        nftId: 1,
        points: 0,
        hash: isOGNFTEligible.data?.hash || '0',
        signature: isOGNFTEligible.data?.sig || [],
      }),
    ],
  });

  const { data: ogNFTBalance } = useContractRead({
    abi: NFTAbi,
    address: process.env.NEXT_PUBLIC_OG_NFT_CONTRACT || '0',
    functionName: 'balanceOf',
    args: [address || '0x0', 1],
  });

  useEffect(() => {
    if (isOGNFTEligible.isSuccess && isOGNFTEligible.data?.totalOgNFTUsers) {
      setProgress(isOGNFTEligible.data.totalOgNFTUsers);
    }

    if (ogNFTBalance && Number(ogNFTBalance.toLocaleString()) !== 0) {
      setHasNFT(true);
    }
  }, [ogNFTBalance, isOGNFTEligible]);

  useEffect(() => {
    if (address) {
      isOGNFTEligible.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  function copyReferralLink() {
    if (window.location.origin.includes('app.strkfarm.xyz')) {
      navigator.clipboard.writeText(`https://strkfarm.xyz/r/${referralCode}`);
    } else {
      navigator.clipboard.writeText(getReferralUrl(referralCode));
    }

    toast.success('Referral link copied to clipboard', {
      position: 'bottom-right',
    });
  }

  function handleEligibility() {
    if (!address) {
      toast.error('Please connect wallet', {
        position: 'bottom-right',
      });
      return;
    }

    if (!isEligible) {
      if (!isOGNFTLoading && isOGNFTEligible.data?.isOgNFTUser) {
        setIsEligible(true);
      }
    } else {
      claimOGNFT();
    }

    setIsEligibilityChecked(true);
  }

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
            lineHeight="48px"
            textAlign="left"
            color="white"
          >
            <b className="">Community Program</b>
          </Text>
          <Text
            width="300px"
            color="white"
            textAlign="left"
            fontSize={{ base: '16px', md: '12px' }}
          >
            Earn points to level up and collect NFTs that signal your loyalty.
            These NFTs unlock future rewards and exclusive incentives.
          </Text>

          <Link href="https://docs.strkfarm.xyz/p/community" isExternal={true}>
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
                background:
                  'linear-gradient(90deg, rgba(111, 79, 242, 0.4) 0%, rgba(97, 252, 174, 0.4) 100%)',
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
          </Link>
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
                borderColor="#3B4A3E"
              >
                <Text color="white" fontSize={{ base: '8px', md: '12px' }}>
                  {!referralCode
                    ? 'Referral link loading...'
                    : `https://strkfarm.xyz/r/${referralCode}`}
                </Text>

                <Button
                  background="transparent"
                  border="none"
                  color="#87F9D5"
                  fontSize={{ base: '8px', md: '10px' }}
                  _hover={{
                    bg: 'transparent',
                  }}
                  isDisabled={referralCode.length === 0}
                  onClick={copyReferralLink}
                >
                  Copy link
                </Button>
              </Box>
              <Link
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('I am proud to be part of @strkfarm community. They are issuing points and NFTs for their active users.\n\nJoin using my referral link:')}%20https://strkfarm.xyz/r/${referralCode}`}
                isExternal={true}
              >
                <Button
                  display="flex"
                  alignItems="center"
                  variant="outline"
                  padding={{ base: '5px', md: '10px' }}
                  border="1px"
                  borderColor="#3B4A3E"
                  borderRadius="5px"
                  _hover={{
                    bg: 'color2_50p',
                  }}
                  isDisabled={referralCode.length === 0}
                >
                  <ChakraImage src={x.src} height="25px" />
                </Button>
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        display="flex"
        margin="40px 0"
        gap={{ base: '15px', md: '30px' }}
        padding={{ base: '10px 10px', md: '20px 20px' }}
        className="theme-gradient"
        borderRadius="10px"
      >
        <Box display="flex" flexDirection="column" width="100%">
          <Text
            color="white"
            fontSize={{ base: '14px', md: '22px' }}
            marginBottom={{ base: '10px', md: '20px' }}
          >
            <b>OG Farmer Limited edition NFT</b>
          </Text>
          <Box display="flex" flexDirection="column" marginBottom="15px">
            <Box
              display="flex"
              gap="5px"
              alignItems="center"
              alignSelf="flex-end"
            >
              {isOGNFTLoading && <Spinner size="sm" color="white" />}
              <Text fontSize={{ base: '10px', md: '16px' }} color="white">
                <b>{`${progress}/100 Selected`}</b>
              </Text>
            </Box>

            <Progress
              value={progress}
              size={{ base: 'xs', md: 'md' }}
              bg="#E2E2E240"
              sx={{
                '& > div': {
                  backgroundColor: '#795BF4',
                },
              }}
            />
          </Box>
          <Box
            display="flex"
            flexDirection={{ base: 'column', md: 'row' }}
            gap={{ base: '5px', md: '10px' }}
            alignItems={{ md: 'center' }}
          >
            <Button
              background="purple"
              borderRadius="5px"
              marginRight={{ base: 'auto', md: '0' }}
              height={{ base: '30px', md: '40px' }}
              _hover={{
                bg: 'bg',
                borderColor: 'purple',
                borderWidth: '1px',
                color: 'purple',
              }}
              onClick={handleEligibility}
              isDisabled={hasNFT || isOGNFTLoading || !isOGNFTEligible.data}
            >
              <Text fontSize={{ base: '10px', md: '14px' }} color="white">
                {!address
                  ? 'Connect wallet to check eligibility'
                  : hasNFT
                    ? 'Claimed'
                    : !isEligible
                      ? 'Check eligibility'
                      : 'Claim'}
              </Text>
            </Button>

            <Text
              fontSize={{ base: '10px', md: '14px' }}
              color={isEligible ? '#7DFACB' : '#FA7D7D'}
            >
              {!isEligible && isEligibilityChecked && (
                <>
                  You&apos;re not eligible, but you can still earn one.{' '}
                  <Link
                    href="https://docs.strkfarm.xyz/p/community/og-farmer-nft-campaign"
                    textDecoration="underline"
                    isExternal={true}
                  >
                    Learn how here
                  </Link>
                </>
              )}
              {isEligible &&
                isEligibilityChecked &&
                '🎉 Congratulations. You are eligible.'}
            </Text>
          </Box>
        </Box>
        <Box borderRadius="10px">
          <ChakraImage
            src={og_nft.src}
            width={{ base: '200px', md: '250px' }}
            height={{ base: '120px', md: '200px' }}
            borderRadius="10px"
          />
        </Box>
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        gap="10px"
        padding={{ base: '10px 10px', md: '20px 20px' }}
        className="theme-gradient"
        borderRadius="10px"
      >
        <Text color="white" fontSize={{ base: '14px', md: '22px' }}>
          <b>Your Stats</b>
        </Text>
        <Box
          position="relative"
          width="100%"
          justifyContent="space-between"
          alignItems="center"
          padding="15px 15px"
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
            background:
              'linear-gradient(90deg, rgba(111, 79, 242, 0.2) 0%, rgba(97, 252, 174, 0.2) 100%)',
            WebkitMask:
              'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'destination-out',
            maskComposite: 'exclude',
            zIndex: -1,
          }}
        >
          <Text color="white" fontSize={{ base: '12px', md: '16px' }}>
            Coming soon
          </Text>
        </Box>
        <Text
          color="white"
          fontSize={{ base: '12px', md: '12px' }}
          marginBottom="30px"
        >
          You will be able to check your points and claim your NFTs here soon.
        </Text>
      </Box>
    </Container>
  );
};

export default CommunityPage;
