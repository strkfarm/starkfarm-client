import React, { useMemo } from 'react';
import {
  Box,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  Tag,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { useAccount } from '@starknet-react/core';
import { StrategyInfo } from '@/store/strategies.atoms';
import { HarvestTimeAtom } from '@/store/harvest.atom';
import { useAtomValue } from 'jotai';
import { formatTimediff, getDisplayCurrencyAmount, timeAgo } from '@/utils';
import { isMobile } from 'react-device-detect';

interface HarvestTimeProps {
  strategy: StrategyInfo;
  balData: any;
}

const HarvestTime: React.FC<HarvestTimeProps> = ({ strategy, balData }) => {
  const { address } = useAccount();
  const holdingToken: any = strategy.holdingTokens[0];
  const contractAddress = holdingToken.address || holdingToken.token || '';

  const harvestTimeAtom = useMemo(
    () => HarvestTimeAtom(contractAddress),
    [address],
  );

  const harvestTime = useAtomValue(harvestTimeAtom);

  const data = harvestTime.data?.findManyHarvests[0];

  const lastHarvest = useMemo(() => {
    if (!data || !data.timestamp) return null;
    return new Date(Number(data.timestamp) * 1000);
  }, [data?.timestamp]);

  const harvestTimestamp = useMemo(() => {
    const DAYMS = 86400 * 1000;
    // Base date is last harvest time + 2 days or now (for no harvest strats)
    const baseDate = lastHarvest
      ? new Date(lastHarvest.getTime() + 2 * DAYMS)
      : new Date();

    // With base date, get next sunday 12am UTC
    // set date to coming sunday in UTC
    const nextHarvest = baseDate;
    nextHarvest.setUTCDate(
      nextHarvest.getUTCDate() + (7 - nextHarvest.getUTCDay()),
    );
    nextHarvest.setUTCHours(0);
    nextHarvest.setUTCMinutes(0);
    nextHarvest.setUTCSeconds(0);

    // if nextHarvest is within 24hrs of last harvest,
    // increase it by 7 days
    // This is needed as harvest can happen anytime near deadline
    if (
      lastHarvest &&
      nextHarvest.getTime() - lastHarvest.getTime() < 86400 * 1000
    ) {
      nextHarvest.setUTCDate(nextHarvest.getUTCDate() + 7);
    }

    return formatTimediff(nextHarvest);
  }, [data?.timestamp, lastHarvest]);

  return (
    <Box>
      <Flex justifyContent="space-between">
        <Flex>
          <Stat
            marginRight={'5px'}
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'flex-end'}
          >
            <StatLabel>APY</StatLabel>
            <StatNumber color="cyan" lineHeight="24px">
              {(strategy.netYield * 100).toFixed(2)}%
            </StatNumber>
          </Stat>
          <Flex flexDirection={'column'} justifyContent={'flex-end'}>
            <Tooltip label="This shows how much higher your yield is compared to zKLend">
              <Tag
                bg="bg"
                color={'white'}
                fontSize={'12px'}
                padding={'2px 5px'}
              >
                🔥{strategy.leverage.toFixed(2)}x boosted
              </Tag>
            </Tooltip>
          </Flex>
        </Flex>

        {!isMobile && (
          <Tooltip
            label={`This is when your investment increases as STRK rewards are automatically claimed and reinvested into the strategy's tokens.`}
          >
            <Box>
              <Text
                color="#D4D4D6"
                fontSize="14px"
                fontWeight="500"
                display={'flex'}
              >
                Next Harvest in:{' '}
                {harvestTimestamp.isZero && (
                  <Text color={'cyan'} fontWeight={'bold'} marginLeft={'5px'}>
                    Anytime now
                  </Text>
                )}
              </Text>
              <Box
                display="flex"
                alignItems="center"
                pt="5px"
                gap="10px"
                justifyContent="space-between"
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                  gap="4px"
                  bgColor="color2_50p"
                  width="53px"
                  height="53px"
                  borderRadius="8px"
                >
                  <Text color="#AEAEAE" fontSize="12px" fontWeight="300">
                    Days
                  </Text>
                  <Text color="white" fontWeight="semi-bold">
                    {harvestTimestamp.days ?? 0}
                  </Text>
                </Box>

                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                  gap="4px"
                  bgColor="color2_50p"
                  width="53px"
                  height="53px"
                  borderRadius="8px"
                >
                  <Text color="#AEAEAE" fontSize="12px" fontWeight="300">
                    Hour
                  </Text>
                  <Text color="white" fontWeight="semi-bold">
                    {harvestTimestamp.hours ?? 0}
                  </Text>
                </Box>

                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                  gap="4px"
                  bgColor="color2_50p"
                  width="53px"
                  height="53px"
                  borderRadius="8px"
                >
                  <Text color="#AEAEAE" fontSize="12px" fontWeight="300">
                    Mins
                  </Text>
                  <Text color="white" fontWeight="semi-bold">
                    {harvestTimestamp.minutes ?? 0}
                  </Text>
                </Box>
              </Box>
            </Box>
          </Tooltip>
        )}
      </Flex>

      <Box
        display="flex"
        padding="5px"
        width={'100%'}
        bg="bg"
        marginTop={'10px'}
        borderRadius={'5px'}
      >
        <Text
          color="white"
          fontSize="12px"
          fontWeight="normal"
          textAlign={isMobile ? 'left' : 'right'}
          width={'100%'}
        >
          Harvested{' '}
          <b>
            {getDisplayCurrencyAmount(
              harvestTime?.data?.totalStrkHarvestedByContract.STRKAmount || 0,
              2,
            )}{' '}
            STRK
          </b>{' '}
          over <b>{harvestTime?.data?.totalHarvestsByContract} claims.</b>{' '}
          {lastHarvest && (
            <span>
              Last harvested <b>{timeAgo(lastHarvest)}</b>.
            </span>
          )}
        </Text>
      </Box>
    </Box>
  );
};

export default HarvestTime;
