import { strategiesAtom } from '@/store/strategies.atoms';
import { dAppStatsAtom, userStatsAtom } from '@/store/utils.atoms';
import { CopyIcon } from '@chakra-ui/icons';
import {
  Box,
  Card,
  Grid,
  GridItem,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import React from 'react';

interface TVLProps {
  referralCode: string;
}

const TVL: React.FC<TVLProps> = ({ referralCode }) => {
  const _strategies = useAtomValue(strategiesAtom);
  const { data, isPending } = useAtomValue(dAppStatsAtom);
  const { data: userData, isPending: userStatsPending } =
    useAtomValue(userStatsAtom);

  return (
    <Grid
      templateColumns={{ base: 'repeat(1, 1, 1fr)', md: 'repeat(3, 1fr)' }}
      gap="6"
      width="100%"
    >
      <GridItem display="flex">
        <Card width="100%" padding={'15px 30px'} color="white" bg="bg">
          <Stat>
            <StatLabel>Total Value locked (TVL)</StatLabel>
            <StatNumber>
              $
              {isPending ? (
                <Spinner size="sm" color="white" marginLeft={'5px'} />
              ) : (
                Number(data?.tvl.toFixed(2)).toLocaleString()
              )}
            </StatNumber>
          </Stat>
        </Card>
      </GridItem>

      <GridItem display="flex">
        <Card width="100%" padding={'15px 30px'} color="white" bg="bg">
          <Stat>
            <StatLabel>Your holdings ($)</StatLabel>
            <StatNumber>
              $
              {userStatsPending ? (
                <Spinner size="sm" color="white" marginLeft={'5px'} />
              ) : !userData ? (
                0
              ) : (
                Number(userData?.holdingsUSD.toFixed(2)).toLocaleString()
              )}
            </StatNumber>
          </Stat>
        </Card>
      </GridItem>

      <GridItem display="flex">
        <Card width="100%" padding={'15px 30px'} color="white" bg="purple">
          <Stat>
            <StatLabel>Your referral link (?)</StatLabel>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <StatNumber
                fontSize="1.5rem"
                textDecoration="underline"
                fontWeight="600"
              >
                {referralCode}
              </StatNumber>

              <CopyIcon
                cursor="pointer"
                onClick={() => navigator.clipboard.writeText(referralCode)}
              />
            </Box>
          </Stat>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default TVL;
