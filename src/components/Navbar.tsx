import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Center,
  Container,
  Flex,
  IconButton,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';
import { useAtom, useSetAtom } from 'jotai';
import { useStarknetkitConnectModal } from 'starknetkit';

import { CONNECTOR_NAMES, MYCONNECTORS } from '@/app/template';
import tg from '@/assets/tg.svg';
import CONSTANTS from '@/constants';
import { getERC20Balance } from '@/store/balance.atoms';
import { addressAtom } from '@/store/claims.atoms';
import { lastWalletAtom } from '@/store/utils.atoms';
import {
  getTokenInfoFromName,
  MyMenuItemProps,
  MyMenuListProps,
  shortAddress,
} from '@/utils';
import fulllogo from '@public/fulllogo.png';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useStarkProfile,
} from '@starknet-react/core';
import mixpanel from 'mixpanel-browser';
import { useEffect } from 'react';
import { isMobile } from 'react-device-detect';

interface NavbarProps {
  hideTg?: boolean;
  forceShowConnect?: boolean;
}

export default function Navbar(props: NavbarProps) {
  const { address, connector } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const setAddress = useSetAtom(addressAtom);
  const { data: starkProfile } = useStarkProfile({
    address,
    useDefaultPfp: true,
  });
  const [lastWallet, setLastWallet] = useAtom(lastWalletAtom);
  const { starknetkitConnectModal: starknetkitConnectModal1 } =
    useStarknetkitConnectModal({
      modalMode: 'canAsk',
      modalTheme: 'dark',
      connectors: MYCONNECTORS,
    });

  // backup
  const { starknetkitConnectModal: starknetkitConnectModal2 } =
    useStarknetkitConnectModal({
      modalMode: 'alwaysAsk',
      modalTheme: 'dark',
      connectors: MYCONNECTORS,
    });

  const getTokenBalance = async (token: string, address: string) => {
    const tokenInfo = getTokenInfoFromName(token);
    const balance = await getERC20Balance(tokenInfo, address);

    return balance.amount.toEtherToFixedDecimals(6);
  };

  useEffect(() => {
    (async () => {
      if (address) {
        mixpanel.track('wallet connect trigger', {
          address,
          ethAmount: await getTokenBalance('ETH', address),
          usdcAmount: await getTokenBalance('USDC', address),
          strkAmount: await getTokenBalance('STRK', address),
        });
      }
    })();
  }, [address]);

  // Connect wallet using starknetkit
  const connectWallet = async () => {
    try {
      const result = await starknetkitConnectModal1();

      connect({ connector: result.connector });
    } catch (error) {
      console.warn('connectWallet error', error);
      try {
        const result = await starknetkitConnectModal2();
        connect({ connector: result.connector });
      } catch (error) {
        console.error('connectWallet error', error);
        alert('Error connecting wallet');
      }
    }
  };

  function autoConnect(retry = 0) {
    console.log('lastWallet', lastWallet, connectors);
    try {
      if (!address && lastWallet) {
        const connectorIndex = CONNECTOR_NAMES.findIndex(
          (name) => name === lastWallet,
        );
        if (connectorIndex >= 0) {
          connect({ connector: MYCONNECTORS[connectorIndex] });
        }
      }
    } catch (error) {
      console.error('lastWallet error', error);
      if (retry < 10) {
        setTimeout(() => {
          autoConnect(retry + 1);
        }, 1000);
      }
    }
  }
  // Auto-connects to last wallet
  useEffect(() => {
    autoConnect();
  }, [lastWallet]);

  // Set last wallet when a new wallet is connected
  useEffect(() => {
    console.log('lastWallet connector', connector?.name);
    if (connector) {
      const name: string = connector.name;
      setLastWallet(name);
    }
  }, [connector]);

  // set address atom
  useEffect(() => {
    setAddress(address);
  }, [address]);

  return (
    <Container
      width={'100%'}
      padding={'0'}
      borderBottom={'1px solid var(--chakra-colors-color2)'}
      position={'fixed'}
      bg="bg"
      zIndex={999}
      top="0"
    >
      <Center bg="highlight" color="orange" padding={0}>
        <Text fontSize="12px" textAlign={'center'} padding="0px 5px">
          {''}
          <b>Report bugs & share feedback in our Telegram group.</b>
          {''}
        </Text>
      </Center>
      <Box
        width={'100%'}
        maxWidth="1400px"
        margin={'0px auto'}
        padding={'20px 20px 10px'}
      >
        <Flex width={'100%'}>
          <Link href="/" margin="0 auto 0 0" textAlign={'left'}>
            <Image
              src={fulllogo.src}
              alt="logo"
              height={{ base: '40px', md: '50px' }}
            />
          </Link>
          {/* <Link href={'/claims'} isExternal>
            <Button
              margin="0 0 0 auto"
              borderColor="color2"
              color="color2"
              variant="ghost"
              marginRight={'30px'}
              leftIcon={
                <Avatar
                  size="sm"
                  bg="highlight"
                  color="color2"
                  name="T G"
                  src={CONSTANTS.LOGOS.STRK}
                />
              }
              _hover={{
                bg: 'color2_50p',
              }}
              display={{ base: 'none !important', md: 'flex !important' }}
            >
              Claims
            </Button>
          </Link> */}
          {!props.hideTg && (
            <Link href={CONSTANTS.COMMUNITY_TG} isExternal>
              <Button
                margin="0 0 0 auto"
                borderColor="color2"
                color="color2"
                variant="outline"
                rightIcon={
                  <Avatar
                    size="sm"
                    bg="highlight"
                    color="color2"
                    name="T G"
                    src={tg.src}
                  />
                }
                _hover={{
                  bg: 'color2_50p',
                }}
                display={{ base: 'none !important', md: 'flex !important' }}
                className="glow-button"
              >
                Join Telegram
              </Button>
              <IconButton
                aria-label="tg"
                variant={'ghost'}
                borderColor={'color2'}
                display={{ base: 'block', md: 'none' }}
                icon={
                  <Avatar
                    size="sm"
                    bg="highlight"
                    className="glow-button"
                    name="T G"
                    color="color2"
                    src={tg.src}
                    _hover={{
                      bg: 'color2_50p',
                    }}
                  />
                }
              />
            </Link>
          )}
          {(!isMobile || props.forceShowConnect) && (
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={address ? <ChevronDownIcon /> : <></>}
                iconSpacing={{ base: '1px', sm: '5px' }}
                bgColor={'purple'}
                color="white"
                borderColor={'purple'}
                borderWidth="1px"
                _hover={{
                  bg: 'bg',
                  borderColor: 'purple',
                  borderWidth: '1px',
                  color: 'purple',
                }}
                _active={{
                  bg: 'bg',
                  borderColor: 'purple',
                  color: 'purple',
                }}
                marginLeft={'10px'}
                display={{ base: 'flex' }}
                height={{ base: '2rem', sm: '2.5rem' }}
                my={{ base: 'auto', sm: 'initial' }}
                paddingX={{ base: '0.5rem', sm: '1rem' }}
                fontSize={{ base: '0.8rem', sm: '1rem' }}
                onClick={address ? undefined : connectWallet}
                size="xs"
              >
                <Center>
                  {address ? (
                    starkProfile ? (
                      <Box display="flex" alignItems="center" gap=".5rem">
                        <Image
                          src={starkProfile?.profilePicture}
                          alt="pfp"
                          width={30}
                          height={30}
                          rounded="full"
                        />{' '}
                        <h3>{starkProfile?.name}</h3>
                      </Box>
                    ) : (
                      shortAddress(address)
                    )
                  ) : (
                    'Connect'
                  )}
                </Center>
              </MenuButton>
              <MenuList {...MyMenuListProps}>
                {address && (
                  <MenuItem
                    {...MyMenuItemProps}
                    onClick={() => {
                      disconnectAsync().then((data) => {
                        console.log('wallet disconnected');
                        setLastWallet(null);
                      });
                    }}
                  >
                    Disconnect
                  </MenuItem>
                )}
              </MenuList>
            </Menu>
          )}
        </Flex>
      </Box>
    </Container>
  );
}
