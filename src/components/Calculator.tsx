'use client';
/* eslint-disable padded-blocks */
/* eslint-disable react-hooks/exhaustive-deps */
import { SettingsIcon } from '@chakra-ui/icons';
import {
  Box,
  InputGroup,
  Select,
  Text,
  Badge,
  Img,
  Flex,
  Input,
  InputRightElement,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
} from '@chakra-ui/react';
import { useMediaQuery } from 'react-responsive';
import React, { useCallback, useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface RefinedBadgeProps {
  switch?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function getYFromX(x: number, sa: number, sb: number, sp: number): number {
  return (x * (sp - sa) * sp * sb) / (sb - sp);
}

function get_il(Pnow: number, Pstart: number, Pa: number, Pb: number): number {
  const k = Pnow / Pstart;
  return (
    (2 * Math.sqrt(k) - 1 - k) /
    (1 + k - Math.sqrt(Pa / Pstart) - k * Math.sqrt(Pstart / Pb))
  );
}

function get_hodlings_usd(
  xQty: number,
  xPrice: number,
  yQty: number,
  yPrice: number,
): number {
  return xQty * xPrice + yQty * yPrice;
}

function RefinedBadge({
  switch: isActive = false,
  children,
  onClick,
}: RefinedBadgeProps) {
  const isMobile = useMediaQuery({
    query: '(max-width: 600px)',
  });
  return (
    <Badge
      cursor={'pointer'}
      onClick={onClick}
      display={'flex'}
      justifyContent={'center'}
      alignItems={'center'}
      bgColor={isActive ? '#20555F' : '#30323B'}
      width={isMobile ? '33px' : '50px'}
      textAlign={'center'}
      fontSize={isMobile ? 'x-small' : 'normal'}
      border={
        isMobile
          ? isActive
            ? '#19E3F0 solid 1px'
            : '#43454F solid 1px'
          : isActive
            ? '#19E3F0 solid 2px'
            : '#43454F solid 2px'
      }
      borderRadius={'5px'}
      padding={isMobile ? '3px 6px' : '5px 8px'}
      textColor={isActive ? '#19E3F0' : '#FFFFFF'}
    >
      {children}
    </Badge>
  );
}

export const Calculator: React.FC = () => {
  const [isStrk, setIsStrk] = useState(false);
  const [chartPeriod, setChartPeriod] = useState({
    twoWeek: false,
    oneMonth: true,
    threeMonth: false,
    sixMonth: false,
    oneYear: false,
    twoYear: false,
  });
  const initialDate = {
    twoWeek: false,
    oneMonth: false,
    threeMonth: false,
    sixMonth: false,
    oneYear: false,
    twoYear: false,
  };

  const [tokenUSD, setTokenUSD] = useState({
    bitcoin: {
      usd: 61381,
    },
    dai: {
      usd: 0.999849,
    },
    ethereum: {
      usd: 2971.78,
    },
    starknet: {
      usd: 1.24,
    },
    tether: {
      usd: 1,
    },
    'usd-coin': {
      usd: 1,
    },
  });

  const xDecimals = 18;
  const yDecimals = 18;

  const [simulationPeriod, setSimulationPeriod] = useState(14);
  const [expectedYieldPercent, setExpectedYieldPeriod] = useState(100);

  const [Pa, setPa] = useState(1500);
  const [Pb, setPb] = useState(1700);
  const [P, setP] = useState(1600);
  const [yPrice, setYPrice] = useState(2.0);
  const x = Math.pow(10, 18); // initial ETH investment
  const y = getYFromX(x, Math.sqrt(Pa), Math.sqrt(Pb), Math.sqrt(P));

  const Pdiff = Pb - Pa;
  const step = (Pdiff * 2) / 100;

  const dataRows: any[] = [];
  for (let Pnow = Pa - Pdiff / 2; Pnow <= Pb + Pdiff / 2; Pnow += step) {
    const xPrice = yPrice * (Pnow * Math.pow(10, xDecimals - yDecimals));
    const hdl = get_hodlings_usd(
      x / Math.pow(10, xDecimals),
      xPrice,
      y / Math.pow(10, yDecimals),
      yPrice,
    );
    const il = get_il(Pnow, P, Pa, Pb);
    const valueWithIL = hdl * (1 + il);
    const expectedYield =
      (hdl * (expectedYieldPercent / 100) * simulationPeriod) / 365;
    const netValue = valueWithIL + expectedYield;
    dataRows.push({
      price: Pnow,
      hodl: hdl,
      ILValue: valueWithIL,
      netValue,
    });
  }

  const fetchInitialPrices = useCallback(async () => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=ethereum,starknet,tether,usd-coin,dai,bitcoin&vs_currencies=usd`,
      );

      if (!response.ok) {
        throw new Error(`Error fetching token prices: ${response.statusText}`);
      }

      const tokenPrices = await response.json();
      setTokenUSD(tokenPrices);
    } catch (error) {
      console.error('Error fetching token prices:', error);
    }
  }, []);

  const isTab = useMediaQuery({
    query: '(max-width: 930px)',
  });
  const isMobile = useMediaQuery({
    query: '(max-width: 600px)',
  });

  useEffect(() => {
    fetchInitialPrices();
  }, []);

  useEffect(() => {
    setYPrice(tokenUSD.starknet.usd);
  }, [tokenUSD]);

  useEffect(() => {
    const period = chartPeriod.twoWeek
      ? 14
      : chartPeriod.oneMonth
        ? 30
        : chartPeriod.threeMonth
          ? 90
          : chartPeriod.sixMonth
            ? 182
            : chartPeriod.oneYear
              ? 365
              : chartPeriod.twoYear
                ? 730
                : 90;
    setSimulationPeriod(period);
  }, [chartPeriod]);

  console.log(dataRows);

  return (
    <Box
      width={'100%'}
      color={'#F2F2F2'}
      minHeight={'600px'}
      bg={'#272932'}
      float={'left'}
    >
      <Flex
        width={'100%'}
        alignItems={'center'}
        borderBottom={'solid #020612 1px'}
        padding={'20px 10px'}
        position={'relative'}
        boxSizing="border-box"
        mb={'25px'}
      >
        <Text
          isTruncated
          fontSize={isMobile ? 'small' : 'normal'}
          m={'auto'}
          fontWeight={600}
          width={'calc(100% - 20px)'}
          textAlign={isMobile ? 'start' : 'center'}
          position={'absolute'}
          pr={'30px'}
        >
          Concentrated liquidity impermanent loss calculator
        </Text>
        <Menu>
          <MenuButton
            width={isMobile ? '15px' : '20px'}
            marginLeft={'auto'}
            as={IconButton}
            aria-label="Options"
            _hover={'none'}
            border={'none'}
            _active={'none'}
            icon={<SettingsIcon color={'#ffff'} />}
            variant="outline"
          />
          <MenuList color={'black'}></MenuList>
        </Menu>
      </Flex>
      <Text
        color={'#B5B5B5'}
        margin={'0px'}
        fontSize={isMobile ? 'small' : 'normal'}
        padding={`10px ${isMobile ? '8px' : '50px'}`}
      >
        Select pair to add liquidity
      </Text>
      <Box padding={`0px ${isMobile ? '8px' : '50px'}`}>
        <Box
          display={'flex'}
          gap={isMobile ? '5px' : '20px'}
          justifyContent={'space-between'}
        >
          <Box alignItems={'center'} flex={1} position={'relative'}>
            <InputGroup
              bg={'#292C38'}
              display={'flex'}
              paddingLeft={'13px'}
              border={'#414B73 solid 2px'}
              borderRadius={'10px'}
            >
              <Img
                src="https://cryptologos.cc/logos/starknet-token-strk-logo.svg?v=032"
                width={5}
              />
              <Select
                fontSize={isMobile ? 'small' : 'normal'}
                border={'none'}
                _focus={{
                  outline: 'none',
                  boxShadow: 'none',
                  border: 'none',
                }}
                placeholder="STRK"
              >
                <option value="STRK">STRK</option>
              </Select>
            </InputGroup>
          </Box>
          <Box alignItems={'center'} flex={1} position={'relative'}>
            <InputGroup
              bg={'#292C38'}
              display={'flex'}
              border={'#414B73 solid 2px'}
              borderRadius={'10px'}
            >
              <Select
                fontSize={isMobile ? 'small' : 'normal'}
                border={'none'}
                _focus={{
                  outline: 'none',
                  boxShadow: 'none',
                  border: 'none',
                }}
                placeholder="Select a token"
              >
                <option color="black" value="ETH">
                  ETH
                </option>
                <option color="black" value="USDC">
                  USDC
                </option>
                <option color="black" value="USDT">
                  USDT
                </option>
                <option color="black" value="DAI">
                  DAI
                </option>
              </Select>
            </InputGroup>
          </Box>
        </Box>
      </Box>
      <Box
        height={'fit-content'}
        padding={'20px'}
        borderRadius={'10px'}
        minHeight={'100px'}
        margin={`35px ${isMobile ? '8px' : '50px'}`}
        bg={'#23252E'}
      >
        <Box display={'flex'} justifyContent={'space-between'}>
          <Text color={'#fff'} fontSize={isMobile ? 'small' : 'medium'}>
            Liquidity range
          </Text>
          <Text fontSize={'small'} fontWeight={600} color={'#B5B5B5'}>
            STRK for ETH
          </Text>
        </Box>
        <Flex mb={'5'} gap={'2px'} justifyContent={'end'}>
          <RefinedBadge onClick={() => setIsStrk(true)} switch={isStrk}>
            STRK
          </RefinedBadge>
          <RefinedBadge onClick={() => setIsStrk(false)} switch={!isStrk}>
            ETH
          </RefinedBadge>
        </Flex>
        <Flex gap={isMobile ? '1' : '5'} justifyContent={'space-between'}>
          <Box>
            <Text
              fontSize={isMobile ? '10px' : 'normal'}
              mb={'2'}
              color={'#B5B5B5'}
            >
              Current price
            </Text>
            <InputGroup color={'#B5B5B5'} size={'md'}>
              <Input
                border={'solid 1px #3F4971'}
                p="2"
                onChange={(e) => {
                  setP(Number(e.target.value));
                }}
                fontSize={isMobile ? '10px' : 'normal'}
                type={'number'}
                value={P}
                _placeholder={{ color: '#3F4971' }}
                placeholder="100000"
              />
              <InputRightElement p="2" width="fit-content">
                <Text fontSize={isMobile ? '10px' : 'normal'} color={'#3F4971'}>
                  USDT
                </Text>
              </InputRightElement>
            </InputGroup>
          </Box>
          <Box>
            <Text
              fontSize={isMobile ? '10px' : 'normal'}
              mb={'2'}
              color={'#B5B5B5'}
            >
              Min price
            </Text>
            <InputGroup color={'#B5B5B5'} size={'md'}>
              <Input
                border={'solid 1px #3F4971'}
                p="2"
                type={'number'}
                onChange={(e) => {
                  setPa(Number(e.target.value));
                }}
                value={Pa}
                fontSize={isMobile ? '10px' : 'normal'}
                _placeholder={{ color: '#3F4971' }}
                placeholder="100000"
              />
              <InputRightElement p="2" width="fit-content">
                <Text fontSize={isMobile ? '10px' : 'normal'} color={'#3F4971'}>
                  USDT
                </Text>
              </InputRightElement>
            </InputGroup>
          </Box>
          <Box>
            <Text
              fontSize={isMobile ? '10px' : 'normal'}
              mb={'2'}
              color={'#B5B5B5'}
            >
              Max price
            </Text>
            <InputGroup color={'#B5B5B5'} size={'md'}>
              <Input
                fontSize={isMobile ? '10px' : 'normal'}
                border={'solid 1px #3F4971'}
                p="2"
                onChange={(e) => {
                  setPb(Number(e.target.value));
                }}
                value={Pb}
                type={'number'}
                _placeholder={{ color: '#3F4971' }}
                placeholder="100000"
              />
              <InputRightElement p="2" width="fit-content">
                <Text fontSize={isMobile ? '10px' : 'normal'} color={'#3F4971'}>
                  USDT
                </Text>
              </InputRightElement>
            </InputGroup>
          </Box>
        </Flex>
      </Box>
      <Box
        mt={'20px'}
        padding={'20px'}
        borderRadius={'10px'}
        minHeight={'100px'}
        height={'fit-content'}
        margin={`35px ${isMobile ? '8px' : '50px'}`}
        bg={'#23252E'}
      >
        <Flex
          flexDir={isTab ? 'column' : 'row'}
          justifyContent={'space-between'}
          gap={isMobile ? '0' : '20px'}
        >
          <Flex
            gap={isMobile ? '1' : '4'}
            justifyContent={isMobile ? 'space-between' : 'none'}
            width={'100%'}
          >
            <Box flex={1}>
              <Text
                fontSize={isMobile ? '11px' : 'normal'}
                mb={'2'}
                color={'#B5B5B5'}
              >
                Amount (STRK)
              </Text>
              <InputGroup width={'100%'} color={'#B5B5B5'} size="md">
                <Input
                  border={'solid 1px #3F4971'}
                  p="2"
                  fontSize={isMobile ? '12px' : 'normal'}
                  type="text"
                  borderRadius={'6px'}
                  readOnly
                  color={'#ffff'}
                  fontWeight={'bold'}
                  value={Pdiff.toLocaleString()}
                  _placeholder={{ color: '#3F4971' }}
                />
              </InputGroup>
            </Box>
            <Box flex={1}>
              <Text
                fontSize={isMobile ? '11px' : 'normal'}
                mb={'2'}
                color={'#B5B5B5'}
              >
                Estimated yield %
              </Text>
              <InputGroup width={'100%'} color={'#B5B5B5'}>
                <Input
                  border={'solid 1px #3F4971'}
                  p="2"
                  fontSize={isMobile ? '12px' : 'normal'}
                  type="number"
                  onChange={(e) => {
                    setExpectedYieldPeriod(Number(e.target.value));
                  }}
                  borderRadius={'6px'}
                  color={'#ffff'}
                  fontWeight={'bold'}
                  value={expectedYieldPercent}
                  _placeholder={{ color: '#3F4971' }}
                />
              </InputGroup>
            </Box>
          </Flex>
          <Box mt={isMobile ? '15' : '5px'}>
            <Text
              textAlign={isTab ? 'left' : 'right'}
              fontSize={'small'}
              color={'#B5B5B5'}
              mb={'2'}
            >
              Simulation period
            </Text>
            <Flex height={'fit-content'} gap={'2px'}>
              <RefinedBadge
                switch={chartPeriod.twoWeek}
                onClick={() =>
                  setChartPeriod({ ...initialDate, twoWeek: true })
                }
              >
                2W
              </RefinedBadge>
              <RefinedBadge
                switch={chartPeriod.oneMonth}
                onClick={() =>
                  setChartPeriod({ ...initialDate, oneMonth: true })
                }
              >
                1M
              </RefinedBadge>
              <RefinedBadge
                switch={chartPeriod.threeMonth}
                onClick={() =>
                  setChartPeriod({ ...initialDate, threeMonth: true })
                }
              >
                3M
              </RefinedBadge>
              <RefinedBadge
                switch={chartPeriod.sixMonth}
                onClick={() =>
                  setChartPeriod({ ...initialDate, sixMonth: true })
                }
              >
                6M
              </RefinedBadge>
              <RefinedBadge
                switch={chartPeriod.oneYear}
                onClick={() =>
                  setChartPeriod({ ...initialDate, oneYear: true })
                }
              >
                1Y
              </RefinedBadge>
              <RefinedBadge
                switch={chartPeriod.twoYear}
                onClick={() =>
                  setChartPeriod({ ...initialDate, twoYear: true })
                }
              >
                2Y
              </RefinedBadge>
            </Flex>
          </Box>
        </Flex>
        <Text
          fontSize={isMobile ? 'small' : 'normal'}
          my={'9px'}
          color={'#19E3F0'}
        >
          {/* Simulation period<span style={{ fontFamily: 'Verdana' }}>(i)</span>: 25
          days */}
          Simulation period: {simulationPeriod} days
        </Text>
        <Text
          my={'10px'}
          color={'#ffff'}
          fontSize={isMobile ? 'normal' : '20px'}
          fontWeight={'bold'}
        >
          Position value vs price in STRK per ETH
        </Text>
        <Box width={'100%'} overflowX={'auto'}>
          <LineChart width={750} height={250} data={dataRows}>
            <Tooltip
              contentStyle={{
                width: 'fit-content',
                height: 'fit-content',
                textTransform: 'uppercase',
                backdropFilter: 'blur(5px)',
                backgroundColor: 'rgb(35, 37, 46, .5)',
                border: '#334E68 solid 1px',
                borderRadius: '10px',
              }}
            />
            <CartesianGrid stroke="#334E68" />
            <XAxis
              dataKey={'price'}
              label={
                <Text color={'white'} fontSize={'medium'}>
                  Price
                </Text>
              }
              tickFormatter={(value) => value}
              tickLine={{ stroke: '#334E68' }}
            />
            <YAxis tickLine={{ stroke: '#5843D7' }} />
            <Line strokeWidth={4} dataKey="hodl" stroke="#5843D7" />
            <Line strokeWidth={4} dataKey="ILValue" stroke="#2D9892" />
            <Line strokeWidth={4} dataKey="netValue" stroke="#F8D72C" />
          </LineChart>
        </Box>
      </Box>
    </Box>
  );
};
