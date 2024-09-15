'use client';

import x from '@/assets/x.svg';
import illustration from '@/assets/illustration.svg';
import { useAtomValue } from 'jotai';
import { referralCodeAtom } from '@/store/referral.store';
import toast from 'react-hot-toast';
import { getReferralUrl } from '@/utils';

import {
  Box,
  Button,
  Image as ChakraImage,
  Container,
  Link,
  Text,
} from '@chakra-ui/react';

const CommunityPage = () => {
  const referralCode = useAtomValue(referralCodeAtom);

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
        flexDirection="column"
        gap="10px"
        padding="10px 20px"
        className="theme-gradient"
        borderRadius="10px"
      >
        <Text color="white">
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
          <Text color="white" fontSize={{ base: '14px', md: '16px' }}>
            Coming soon
          </Text>
        </Box>
        <Text
          color="white"
          fontSize={{ base: '14px', md: '12px' }}
          marginBottom="30px"
        >
          You will be able to check your points and claim your NFTs here soon.
        </Text>
      </Box>
    </Container>
  );
};

export default CommunityPage;
