import React, { useMemo } from 'react';
import {
  Avatar,
  Box,
  Card,
  Center,
  Spinner,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useAccount } from '@starknet-react/core';
import { StrategyInfo } from '@/store/strategies.atoms';
import { HarvestTimeAtom } from '@/store/harvest.atom';
import { useAtomValue } from 'jotai';
import { formatTimestamp, getUniqueById } from '@/utils';
import CONSTANTS from '@/constants';
import { isMobile } from 'react-device-detect';

interface HarvestTimeProps {
  strategy: StrategyInfo;
  balData: any;
}

const HarvestTime: React.FC<HarvestTimeProps> = ({ strategy, balData }) => {
  const { address } = useAccount();
  const contractAddress = strategy.holdingTokens[0].address ?? '';

  const harvestTimeAtom = useMemo(
    () => HarvestTimeAtom(contractAddress),
    [address],
  );

  const harvestTime = useAtomValue(harvestTimeAtom);

  const data = harvestTime.data?.findManyHarvests[0];

  const harvestTimestamp = useMemo(() => {
    if (!data?.timestamp) return null;
    return formatTimestamp(data.timestamp);
  }, [data?.timestamp]);

  return (
    <Box py="20px">
      <Card width="100%" padding={'15px'} color="white" bg="highlight">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Stat>
              <StatLabel>APY</StatLabel>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap="5px"
              >
                <StatNumber color="cyan">
                  {(strategy.netYield * 100).toFixed(2)}%
                </StatNumber>
                <StatHelpText>
                  {strategy.leverage.toFixed(2)}x boosted
                </StatHelpText>
              </Box>
            </Stat>
          </Box>

          <Box>
            <Text color="#D4D4D6" fontSize="14px" fontWeight="500">
              Next Harvest in:
            </Text>
            <Box
              display="flex"
              alignItems="center"
              pt="10px"
              gap="10px"
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
                  Mon
                </Text>
                <Text color="white" fontWeight="semi-bold">
                  {harvestTimestamp?.month}
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
                  Days
                </Text>
                <Text color="white" fontWeight="semi-bold">
                  {harvestTimestamp?.day}
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
                  Hour
                </Text>
                <Text color="white" fontWeight="semi-bold">
                  {harvestTimestamp?.hour}
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
                  {harvestTimestamp?.minute}
                </Text>
              </Box>

              {/* <Box
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
                  Secs
                </Text>
                <Text color="white" fontWeight="semi-bold">
                  {harvestTimestamp?.second}
                </Text>
              </Box> */}
            </Box>
          </Box>
        </Box>

        <Box display="flex" py="20px">
          <Text color="white" fontSize="12px" fontWeight="normal">
            Total rewards harvested:
            <Text as="span">
              <b>
                {(
                  BigInt(data?.amount.toString() ?? '') / BigInt(10 ** 18)
                ).toString()}
              </b>{' '}
              | Total number of times harvested:{' '}
              <b>{harvestTime?.data?.totalHarvests}</b>
            </Text>
          </Text>
        </Box>

        <Box display={{ base: 'block', md: 'flex' }}>
          <Box width={{ base: '100%', md: '100%' }}>
            <Text fontSize={'20px'} marginBottom={'0px'} fontWeight={'bold'}>
              How does it work?
            </Text>
            <Text color="light_grey" marginBottom="5px" fontSize={'15px'}>
              {strategy.description}
            </Text>
            <Wrap>
              {getUniqueById(
                strategy.actions.map((p) => ({
                  id: p.pool.protocol.name,
                  logo: p.pool.protocol.logo,
                })),
              ).map((p) => (
                <WrapItem marginRight={'10px'} key={p.id}>
                  <Center>
                    <Avatar
                      size="2xs"
                      bg={'black'}
                      src={p.logo}
                      marginRight={'2px'}
                    />
                    <Text marginTop={'2px'}>{p.id}</Text>
                  </Center>
                </WrapItem>
              ))}
            </Wrap>
          </Box>
        </Box>

        <Box
          padding={'10px'}
          borderRadius={'10px'}
          bg={'bg'}
          color="cyan"
          marginTop={'20px'}
        >
          {!balData.isLoading &&
            !balData.isError &&
            !balData.isPending &&
            balData.data &&
            balData.data.tokenInfo && (
              <Text>
                <b>Your Holdings: </b>
                {address
                  ? `${balData.data.amount.toEtherToFixedDecimals(4)} ${balData.data.tokenInfo?.name}`
                  : isMobile
                    ? CONSTANTS.MOBILE_MSG
                    : 'Connect wallet'}
              </Text>
            )}
          {(balData.isLoading ||
            balData.isPending ||
            !balData.data?.tokenInfo) && (
            <Text>
              <b>Your Holdings: </b>
              {address ? (
                <Spinner size="sm" marginTop={'5px'} />
              ) : isMobile ? (
                CONSTANTS.MOBILE_MSG
              ) : (
                'Connect wallet'
              )}
            </Text>
          )}
          {balData.isError && (
            <Text>
              <b>Your Holdings: Error</b>
            </Text>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default HarvestTime;
