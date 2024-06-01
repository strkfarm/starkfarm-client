import React from 'react';

import { Box, Text } from '@chakra-ui/react';

export const Hero: React.FC = () => {
  return (
    <Box
      background={`radial-gradient(circle, rgba(15,14,44,1) 69%, rgba(111,79,242,1) 100%)`}
      padding={'55px 30px'}
      borderRadius="10px"
      margin="20px 0px"
    >
      <Text
        fontSize={'35px'}
        display={'flex'}
        justifyContent={'center'}
        fontWeight={600}
        color={'white'}
        textAlign={'center'}
      >
        Starknet DeFi Spring
      </Text>
      <Text
        color="white"
        textAlign={'center'}
        fontSize={'18px'}
        marginBottom={'0px'}
      >
        Identify the best $STRK rewarding pools and maximize your rewards
      </Text>
      {/* <Text color='cyan' textAlign={'center'} fontSize={'18px'} marginBottom={'20px'}>
            Pools: {_filteredPools.length}, pages: {pagesCount}</Text> */}
    </Box>
  );
};
