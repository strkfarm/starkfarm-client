"use client";
import {
  Avatar,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import CONSTANTS from "@/constants";
import { useAccount, useContractWrite } from "@starknet-react/core";
import { callsAtom, rewardsAtom } from "@/store/protocolAtomClaim";
import { useAtomValue } from "jotai";
import { Call } from "starknet";
import { toastError, toastSuccess } from "@/utils/toastMessage";
import { useEffect } from "react";
import CustomTable from "@/components/Table";

export default function Claim() {
  const { address } = useAccount();
  const calls: Call[] = useAtomValue(callsAtom);
  const {
    totalEarned,
    totalClaimed,
    totalUnclaimed,
  }: { totalEarned: number; totalClaimed: number; totalUnclaimed: number } =
    useAtomValue(rewardsAtom);

  const { writeAsync, data, isPending, isError, error, isSuccess } =
    useContractWrite({
      calls: calls,
    });

  const handleClaimReward = () => {
    if (!isError && calls.length > 0 && totalUnclaimed > 0) {
      writeAsync();
    }
  };

  useEffect(() => {
    if (isError && error) {
      toastError({ description: error.message });
    }

    if (isSuccess && data) {
      alert("Rewards claimed successfully");
      toastSuccess({
        description: "Rewards claimed successfully",
      });
    }
  }, [isError, isSuccess, error, data]);



  const columns = [
    { label: 'Protocol', field: 'col1' },
    { label: 'Earned', field: 'col2' },
    { label: 'Claimed', field: 'col3' },
    { label: 'Unclaimed', field: 'col4' },
  ];
  
  const datas = [
    { col1: 'Data 1', col2: 'Data 2', col3: 'Data 3', col4: 'Data 4', },
    // ... add more data objects as needed
  ];
  


  return (
    <Container maxWidth={"1000px"} margin={"0 auto"} padding="30px 10px">
      <Heading as="h2" color="white" marginBottom={"10px"}>
        <Avatar marginRight={"5px"} src={CONSTANTS.LOGOS.STRK} />
        Claim $STRK Tokens
      </Heading>

      {address && (
        <Grid templateColumns="repeat(3, 1fr)" gap="6">
          <GridItem display="flex">
            <Card
              width="100%"
              padding={"15px 30px"}
              color="white"
              bg="highlight"
            >
              <Stat>
                <StatLabel>Total Earned</StatLabel>
                <StatNumber>{totalEarned.toFixed(2)}</StatNumber>
              </Stat>
            </Card>
          </GridItem>
          <GridItem display="flex">
            <Card
              width="100%"
              padding={"15px 30px"}
              color="white"
              bg="highlight"
            >
              <Stat>
                <StatLabel>Total Claimed</StatLabel>
                <StatNumber>{totalClaimed.toFixed(2)}</StatNumber>
              </Stat>
            </Card>
          </GridItem>
          <GridItem display="flex">
            <Card
              width="100%"
              padding={"15px 30px"}
              color="white"
              bg="highlight"
            >
              <Stat>
                <StatLabel>Unclaimed</StatLabel>
                <StatNumber>{totalUnclaimed.toFixed(2)}</StatNumber>
              </Stat>

              {totalUnclaimed > 0 && (
                <Button onClick={handleClaimReward}>
                  {isPending ? <Spinner color="black" /> : "Claim"}
                </Button>
              )}
            </Card>
          </GridItem>
        </Grid>
      )}



    <Box marginTop="40px" >
    <CustomTable columns={columns} data={datas} />
    </Box>


    </Container>
  );
}
