"use client";

import {
  Avatar,
  Button,
  Card,
  Container,
  Grid,
  GridItem,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";

import CONSTANTS from "@/constants";

export default function Claim() {
  return (
    <Container maxWidth={"1000px"} margin={"0 auto"} padding="30px 10px">
      <Heading as="h2" color="white" marginBottom={"10px"}>
        <Avatar marginRight={"5px"} src={CONSTANTS.LOGOS.STRK} />
        Claim $STRK Tokens
      </Heading>
      <Grid templateColumns="repeat(3, 1fr)" gap="6">
        <GridItem display="flex">
          <Card width="100%" padding={"15px 30px"} color="white" bg="highlight">
            <Stat>
              <StatLabel>Total Earned</StatLabel>
              <StatNumber>345,670</StatNumber>
            </Stat>
          </Card>
        </GridItem>
        <GridItem display="flex">
          <Card width="100%" padding={"15px 30px"} color="white" bg="highlight">
            <Stat>
              <StatLabel>Total Claimed</StatLabel>
              <StatNumber>345,670</StatNumber>
            </Stat>
          </Card>
        </GridItem>
        <GridItem display="flex">
          <Card width="100%" padding={"15px 30px"} color="white" bg="highlight">
            <Stat>
              <StatLabel>Unclaimed</StatLabel>
              <StatNumber>345,670</StatNumber>
            </Stat>
            <Button>Claim</Button>
          </Card>
        </GridItem>
      </Grid>
    </Container>
  );
}
