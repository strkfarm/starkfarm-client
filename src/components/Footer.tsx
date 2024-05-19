import { Center, Box } from '@chakra-ui/react';
import Link from 'next/link';
import React from 'react';
import CONSTANTS from '@/constants';
import { Discord } from './Icons/Discord';
import { X } from './Icons/X';
import { Telegram } from './Icons/Telegram';
import { Medium } from './Icons/Medium';
import { useMediaQuery } from 'react-responsive';

export const Footer: React.FC = () => {
  const isMobile = useMediaQuery({
    query: '(max-width: 600px)',
  });
  return (
    <>
      <Center
        fontSize={isMobile ? '9px' : 'normal'}
        mb={'10px'}
        display={'flex'}
        justifyContent={isMobile ? 'space-between' : 'center'}
        width={'100%'}
      >
        <Box
          padding={isMobile ? '6px' : '15px'}
          display={'flex'}
          gap={isMobile ? '5px' : '13px'}
          alignItems={'center'}
          borderRight={isMobile ? 'none' : 'solid 1px #242642'}
        >
          <Link href={CONSTANTS.COMMUNITY_DISCORD} target="_blank">
            <Discord />
          </Link>
          <Link href={CONSTANTS.COMMUNITY_X} target="_blank">
            <X />
          </Link>
          <Link href={CONSTANTS.COMMUNITY_TG} target="_blank">
            <Telegram />
          </Link>
          <Link href={CONSTANTS.COMMUNITY_MEDIUM} target="_blank">
            <Medium />
          </Link>
        </Box>
        <Box
          display={'flex'}
          padding={isMobile ? '6px' : '15px'}
          alignItems={'center'}
          gap={isMobile ? '5px' : '15px'}
          color={'white'}
          fontFamily={`"Poppins", 'Trebuchet MS', sans-serif`}
        >
          <Link href={''}>Privacy</Link>
          <Link href={''}>Term of Use</Link>
          <Link href={''}>Cookie Policy</Link>
          <Link href={''}>FAQ</Link>
        </Box>
      </Center>
    </>
  );
};
