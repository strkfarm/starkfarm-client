'use client';
/* eslint-disable padded-blocks */
/* eslint-disable react-hooks/exhaustive-deps */
import { QuestionIcon, SettingsIcon } from '@chakra-ui/icons';
import { Tooltip as Tippy } from '@chakra-ui/react';
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

interface CustomTickProps {
  x?: number;
  y?: number;
  payload?: {
    value: any;
    index: number;
  };
}

const CustomXAxisTick: React.FC<CustomTickProps> = ({
  x,
  y,
  payload = { value: 0, index: 0 },
}) => {
  const shouldDisplayTick = payload.index % 3 === 0;

  if (!shouldDisplayTick) {
    return <></>;
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" fill="#666">
        {payload.value}
      </text>
    </g>
  );
};

const tokenList = [
  {
    name: 'STRK',
    img: 'https://cryptologos.cc/logos/starknet-token-strk-logo.svg?v=032',
  },
  {
    name: 'ETH',
    img: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=032',
  },
  {
    name: 'DAI',
    img: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg?v=032',
  },
  {
    name: 'USDC',
    img: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=032',
  },
  {
    name: 'USDT',
    img: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=032',
  },
];

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
  const [isInvert, setIsInvert] = useState(false);
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

  const [tokenUSD, setTokenUSD] = useState<any>({
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

  const [imgToken, setImgToken] = useState(
    'https://cryptologos.cc/logos/starknet-token-strk-logo.svg?v=032',
  );
  const [simulationPeriod, setSimulationPeriod] = useState(14);
  const [expectedYieldPercent, setExpectedYieldPeriod] = useState(100);

  const [pair1, setPair1] = useState('STRK');
  const [pair2, setPair2] = useState('ETH');

  const [Pa, setPa] = useState('1500');
  const [Pb, setPb] = useState('1700');
  const [P, setP] = useState('1600');
  const [yPrice, setYPrice] = useState(2.0);
  const x = Math.pow(10, 18); // initial ETH investment
  const y = getYFromX(
    x,
    Math.sqrt(Number(Pa)),
    Math.sqrt(Number(Pb)),
    Math.sqrt(Number(P)),
  );

  const [Pdiff, setPdiff] = useState<any>(Number(Pb) - Number(Pa));
  const step = (Pdiff * 2) / 100;

  const dataRows: any[] = [];
  for (
    let Pnow = Number(Pa) - Pdiff / 2;
    Pnow <= Number(Pb) + Pdiff / 2;
    Pnow += step
  ) {
    const xPrice = yPrice * (Pnow * Math.pow(10, xDecimals - yDecimals));
    const hdl = get_hodlings_usd(
      x / Math.pow(10, xDecimals),
      xPrice,
      y / Math.pow(10, yDecimals),
      yPrice,
    );
    const il = get_il(Pnow, Number(P), Number(Pa), Number(Pb));
    const valueWithIL = hdl * (1 + il);
    const expectedYield =
      (hdl * (expectedYieldPercent / 100) * simulationPeriod) / 365;
    const netValue = valueWithIL + expectedYield;
    dataRows.push({
      price: Pnow.toFixed(2),
      hodl: hdl.toFixed(2),
      ILValue: valueWithIL.toFixed(2),
      netValue: netValue.toFixed(2),
    });
  }

  const fetchInitialPrices = useCallback(async () => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=ethereum,starknet,tether,usd-coin,dai&vs_currencies=usd`,
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
    setP(String((tokenUSD.starknet.usd / tokenUSD.ethereum.usd).toFixed(7)));
  }, []);

  useEffect(() => {
    setYPrice(tokenUSD.starknet.usd);
  }, [tokenUSD]);

  useEffect(() => {
    const pair: any = {
      USDT: 'tether',
      ETH: 'ethereum',
      DAI: 'dai',
      STRK: 'starknet',
      USDC: 'usd-coin',
    };
    const key1 = pair[pair1];
    const key2 = pair[pair2];
    setP(String((tokenUSD[key1].usd / tokenUSD[key2].usd).toFixed(7)));
  }, [pair1, pair2]);

  useEffect(() => {
    setPair1(pair2);
    setPair2(pair1);
  }, [isInvert]);

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
              <Img src={imgToken} width={5} />
              <Select
                fontSize={isMobile ? 'small' : 'normal'}
                border={'none'}
                onChange={(e) => {
                  try {
                    const choosen = tokenList.filter(
                      (item) => item.name === e.target.value,
                    );
                    setImgToken(choosen[0].img);
                    setPair1(e.target.value);
                  } catch {
                    setImgToken(
                      'https://cryptologos.cc/logos/starknet-token-strk-logo.svg?v=032',
                    );
                    setPair1('STRK');
                  }
                }}
                _focus={{
                  outline: 'none',
                  boxShadow: 'none',
                  border: 'none',
                }}
              >
                {tokenList.map((data, index) => (
                  <option
                    key={index}
                    value={data.name}
                    style={{ background: '#414B73', display: 'inline-block' }}
                  >
                    {data.name}
                  </option>
                ))}
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
                value={'ETH'}
                onChange={(e) => {
                  if (e.target.value === '') {
                    setPair2('ETH');
                  } else {
                    setPair2(e.target.value);
                  }
                }}
              >
                {tokenList.map((data, index) => (
                  <option
                    key={index}
                    value={data.name}
                    style={{ background: '#414B73', display: 'inline-block' }}
                  >
                    {data.name}
                  </option>
                ))}
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
            {pair1} for {pair2}
          </Text>
        </Box>
        <Flex mb={'5'} gap={'2px'} justifyContent={'end'}>
          <RefinedBadge onClick={() => setIsInvert(false)} switch={!isInvert}>
            {isInvert ? pair2 : pair1}
          </RefinedBadge>
          <RefinedBadge onClick={() => setIsInvert(true)} switch={isInvert}>
            {!isInvert ? pair2 : pair1}
          </RefinedBadge>
        </Flex>
        <Flex gap={isMobile ? '1' : '5'} justifyContent={'space-between'}>
          <Box>
            <Text
              fontSize={isMobile ? '10px' : 'normal'}
              mb={'2'}
              color={'#B5B5B5'}
            >
              Current price{' '}
              <Tippy
                hasArrow
                label="Current price of the token pair"
                bg="gray.300"
                color="black"
                placement="right"
              >
                <QuestionIcon />
              </Tippy>
            </Text>
            <InputGroup color={'#B5B5B5'} size={'md'}>
              <Input
                border={'solid 1px #3F4971'}
                p="2"
                onChange={(e) => {
                  setP(e.target.value);
                }}
                fontSize={isMobile ? '10px' : 'normal'}
                type={'number'}
                value={P}
                _placeholder={{ color: '#3F4971' }}
                placeholder="100000"
              />
              <InputRightElement p="2" width="fit-content">
                <Text fontSize={isMobile ? '10px' : 'normal'} color={'#3F4971'}>
                  {`${pair1}/${pair2}`}
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
                border={`solid 1px #3F4971`}
                p="2"
                type={'number'}
                onChange={(e) => {
                  setPa(e.target.value);
                }}
                value={Pa}
                fontSize={isMobile ? '10px' : 'normal'}
                _placeholder={{ color: '#3F4971' }}
                placeholder="100000"
              />
              <InputRightElement p="2" width="fit-content">
                <Text fontSize={isMobile ? '10px' : 'normal'} color={'#3F4971'}>
                  {`${pair1}/${pair2}`}
                </Text>
              </InputRightElement>
            </InputGroup>
            {!(Pa <= P) && (
              <Text color="red.500" fontSize={'8px'} mt="2">
                Can&apos;t be higher than current price
              </Text>
            )}
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
                  setPb(e.target.value);
                }}
                value={Pb}
                type={'number'}
                _placeholder={{ color: '#3F4971' }}
                placeholder="100000"
              />
              <InputRightElement p="2" width="fit-content">
                <Text fontSize={isMobile ? '10px' : 'normal'} color={'#3F4971'}>
                  {`${pair1}/${pair2}`}
                </Text>
              </InputRightElement>
            </InputGroup>
            {!(Pb >= P) && (
              <Text color="red.500" fontSize={'8px'} mt="2">
                Can&apos;t be lesser than current price
              </Text>
            )}
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
                Amount ({pair1}){' '}
                <Tippy
                  hasArrow
                  label={`Amount of ${pair1}`}
                  bg="gray.300"
                  color="black"
                  placement="right"
                >
                  <QuestionIcon />
                </Tippy>
              </Text>
              <InputGroup width={'100%'} color={'#B5B5B5'} size="md">
                <Input
                  border={'solid 1px #3F4971'}
                  p="2"
                  fontSize={isMobile ? '12px' : 'normal'}
                  type="text"
                  borderRadius={'6px'}
                  color={'#ffff'}
                  fontWeight={'bold'}
                  onChange={(e) => {
                    setPdiff(Number(e.target.value));
                  }}
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
                Estimated yield %{' '}
                <Tippy
                  hasArrow
                  label="Estimate your yield in percentages %"
                  bg="gray.300"
                  color="black"
                  placement="right"
                >
                  <QuestionIcon />
                </Tippy>
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
              Simulation period{' '}
              <Tippy
                hasArrow
                label="Project into days"
                bg="gray.300"
                color="black"
                placement="right"
              >
                <QuestionIcon />
              </Tippy>
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
          Simulation period: {simulationPeriod} days
        </Text>
        <Text
          my={'10px'}
          color={'#ffff'}
          fontSize={isMobile ? 'normal' : '20px'}
          fontWeight={'bold'}
        >
          Position value vs price in {pair1} per {pair2}
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
              tickFormatter={(value) => value}
              tick={<CustomXAxisTick />}
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
