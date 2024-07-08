import React, { useState, useEffect } from 'react';
import { Box, Text, Flex, Tooltip } from '@chakra-ui/react';

interface StatusIndicatorProps {
    isActive: boolean;
    textColor?: string;
}

export const StatusIndicator = (props: StatusIndicatorProps) => {
    const colors = ['green.500', 'red'];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [color, setColor] = useState(props.isActive ? colors[0] : 'red.500');
  useEffect(() => {
    console.log('color isActive', props.isActive)
    if (props.isActive) {
      const interval = setInterval(() => {
        const index = (currentIndex + 1) % colors.length
        console.log('color', index, colors[index])
        setCurrentIndex(index);
        setColor(colors[index]);
      }, 500);
      return () => clearInterval(interval);
    } else {
        setColor('red.500');
    }
  }, [props.isActive]);

  return (
    <Tooltip label={props.isActive ? "Subscription active and we are monitoring your debts" : "Subscription inactive"}>
        <Flex alignItems={'center'}>
        {/* <Box
            w="10px"
            h="10px"
            borderRadius="50%"
            bg={color}
            mr={1}
            marginTop={'2px'}
        /> */}
        <div className={`dot ${props.isActive ? 'active' : 'inactive'}`}></div>
        {/* <Text textColor={props.textColor || 'light_grey'} fontSize={'14px'}>{props.isActive ? 'ON' : 'OFF'}</Text> */}
        </Flex>
    </Tooltip>
  );
};

export default StatusIndicator;