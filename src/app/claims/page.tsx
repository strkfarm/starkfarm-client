"use client";

import Navbar from "@/components/Navbar";
import EkuboAtoms from "@/store/ekobu.store";
import Ekubo from "@/store/ekobu.store";
import Jediswap from "@/store/jedi.store";
import {
  PoolInfo,
  StrkDexIncentivesAtom,
  allPoolsAtomUnSorted,
  filteredPools,
  sortPoolsAtom,
} from "@/store/pools";
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Container,
  Flex,
  Grid,
  GridItem,
  HStack,
  Heading,
  Image,
  Link,
  LinkBox,
  LinkOverlay,
  Skeleton,
  Spinner,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import {
  Pagination,
  PaginationContainer,
  usePagination,
  PaginationNext,
  PaginationPrevious,
  PaginationPage,
  PaginationPageGroup,
} from "@ajna/pagination";
import CONSTANTS from "@/constants";
import Filters from "@/components/Filters";
import tg from "@/assets/tg.svg";
import Pools from "@/components/Pools";
import Strategies from "@/components/Strategies";
import mixpanel from "mixpanel-browser";

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
