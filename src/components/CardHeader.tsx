'use client';

import { extendTheme } from '@chakra-ui/react';
import { ChakraProvider, Heading, HeadingProps } from '@chakra-ui/react';
import React from 'react';
const customTheme = extendTheme({
  colors: {
    grey_text: '#B6B6B6',
  },
  components: {
    Heading: {
      baseStyle: {
        fontFamily: 'Inter, sans-serif',
      },
    },
  },
});

interface CardHeadingProps extends HeadingProps {}

const CardHeading: React.FC<CardHeadingProps> = (props) => {
  return (
    <ChakraProvider theme={customTheme}>
      <Heading {...props}>{props.children}</Heading>
    </ChakraProvider>
  );
};

export default CardHeading;
