import { Box, Text } from '@chakra-ui/react';
import React from 'react';

export default function HarvestTime() {
  return (
    <Box py="20px">
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box py="30px">
          <Text color="white" fontSize="14px" fontWeight="medium">
            APY
          </Text>
          <Box display="flex" alignItems="center" gap="10px">
            <Text
              fontSize="36px"
              color="#72EFDF"
              lineHeight="36px"
              fontWeight="bold"
            >
              23.94%
            </Text>
            <Box
              bgColor="#1B1D26"
              borderRadius="20px"
              width="126px"
              height="26px"
            >
              <Text color="#D4D4D6" fontSize="14px" fontWeight="medium">
                🔥 1.96x boosted
              </Text>
            </Box>
          </Box>
        </Box>

        <Box>
          <Text color="#D4D4D6" fontSize="14px" fontWeight="500">
            Next Harvest in:
          </Text>
          <Box
            display="flex"
            alignItems="center"
            pt="10px"
            gap="20px"
            justifyContent="space-between"
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
              gap="4px"
              bgColor="#1B1D26"
              width="53px"
              height="53px"
              borderRadius="8px"
            >
              <Text color="#AEAEAE" fontSize="12px" fontWeight="300">
                Days
              </Text>
              <Text color="white" fontWeight="semi-bold">
                18
              </Text>
            </Box>

            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
              gap="4px"
              bgColor="#1B1D26"
              width="53px"
              height="53px"
              borderRadius="8px"
            >
              <Text color="#AEAEAE" fontSize="12px" fontWeight="300">
                Hrs
              </Text>
              <Text color="white" fontWeight="semi-bold">
                15
              </Text>
            </Box>

            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
              gap="4px"
              bgColor="#1B1D26"
              width="53px"
              height="53px"
              borderRadius="8px"
            >
              <Text color="#AEAEAE" fontSize="12px" fontWeight="300">
                Mins
              </Text>
              <Text color="white" fontWeight="semi-bold">
                05
              </Text>
            </Box>

            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
              gap="4px"
              bgColor="#1B1D26"
              width="53px"
              height="53px"
              borderRadius="8px"
            >
              <Text color="#AEAEAE" fontSize="12px" fontWeight="300">
                Sec
              </Text>
              <Text color="white" fontWeight="semi-bold">
                01
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box display="flex" justifyContent="end">
        <Text color="white" fontSize="12px" fontWeight="normal">
          Total rewards harvested:
          <Text as="span">
            <b>$500</b> | Total number of times harvested: <b>48</b>
          </Text>
        </Text>
      </Box>
      <Text color="white" lineHeight="36px" fontSize="24px" fontWeight="bold">
        How does it work?
      </Text>
      <Text
        py="5px"
        color="white"
        fontSize="14px"
        fontWeight="normal"
        lineHeight="21px"
      >
        Deposit your USDC to automatically loop your funds between zkLend and
        Nostra to create a delta neutral position. This strategy is designed to
        maximize your yield on USDC. Your position is automatically adjusted
        periodically to maintain a healthy health factor. You receive a NFT as
        representation for your stake on STRKFarm. You can withdraw anytime by
        redeeming your NFT for USDC.
      </Text>
    </Box>
  );
}
