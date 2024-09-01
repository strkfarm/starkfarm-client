import { addressAtom } from '@/store/claims.atoms';
import { referralCodeAtom } from '@/store/referral.store';
import { strategiesAtom } from '@/store/strategies.atoms';
import { dAppStatsAtom, userStatsAtom } from '@/store/utils.atoms';
import { getReferralUrl } from '@/utils';
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
  Tooltip,
} from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import Link from 'next/link';
import React from 'react';
import toast from 'react-hot-toast';

const TVL: React.FC = () => {
  const _strategies = useAtomValue(strategiesAtom);
  const { data, isPending } = useAtomValue(dAppStatsAtom);
  const { data: userData, isPending: userStatsPending } =
    useAtomValue(userStatsAtom);

  const address = useAtomValue(addressAtom);
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
            <StatLabel fontWeight={'bold'}>
              Your referral link{' '}
              <Tooltip label="Learn more">
                {/* TODO: update the url */}
                <Link
                  href="https://docs.strkfarm.xyz/p/community/referral-campaign"
                  target="_blank"
                >
                  (i)
                </Link>
              </Tooltip>
            </StatLabel>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              {address ? (
                !referralCode ? (
                  <Spinner size="sm" color="white" marginTop={'8px'} />
                ) : (
                  <StatNumber
                    fontSize="1.5rem"
                    textDecoration="underline"
                    fontWeight="600"
                    cursor={'pointer'}
                    onClick={copyReferralLink}
                  >
                    {referralCode}
                  </StatNumber>
                )
              ) : (
                <Tooltip label="Connect wallet">
                  <StatNumber fontSize="1.5rem" fontWeight="600">
                    -
                  </StatNumber>
                </Tooltip>
              )}

              {address && (
                <CopyIcon cursor="pointer" onClick={copyReferralLink} />
              )}
            </Box>
          </Stat>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default TVL;
