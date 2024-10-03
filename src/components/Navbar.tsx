import { ChevronDownIcon, HamburgerIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Center,
  Container,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
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
  standariseAddress,
  truncate,
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
import TncModal from './TncModal';

interface NavbarProps {
  hideTg?: boolean;
  forceShowConnect?: boolean;
}

export default function Navbar(props: NavbarProps) {
  const { address, connector, account } = useAccount();
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

  console.log(account, 'account');

  useEffect(() => {
    (async () => {
      if (address) {
        const standardAddr = standariseAddress(address);
        const userProps = {
          address: standardAddr,
          ethAmount: await getTokenBalance('ETH', address),
          usdcAmount: await getTokenBalance('USDC', address),
          strkAmount: await getTokenBalance('STRK', address),
        };
        mixpanel.track('wallet connect trigger', userProps);
        mixpanel.identify(standariseAddress(standardAddr));
        mixpanel.people.set(userProps);
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
    console.log('tncinfo address', address);
    setAddress(address);
  }, [address]);

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Container
      width={'100%'}
      padding={'0'}
      position={'fixed'}
      bg="black"
      zIndex={999}
      top="0"
    >
      <TncModal />
      <Center bg="bg" color="gray" padding={0}>
        <Text
          fontSize="12px"
          textAlign={'center'}
          padding="6px 5px"
          color="#a5a5d9"
        >
          <b>
            STRKFarm just got <span className="orange">audited</span> by one of
            the top auditors in the ecosystem.
            <Link
              target="_blank"
              href="https://x.com/strkfarm/status/1833071604856987678"
              color="orange"
            >
              {' '}
              Read more
            </Link>
          </b>
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

          <Link href="/" margin="0">
            <Button
              bg="transparent"
              color="color2"
              variant="outline"
              border="none"
              padding={'0'}
              _hover={{
                bg: 'color2_50p',
              }}
              display={{ base: 'none !important', md: 'flex !important' }}
              onClick={() => {
                mixpanel.track('home_clicked');
              }}
            >
              Home
            </Button>
          </Link>
          <Link href="/community" margin="0 10px 0 0">
            <Button
              bg="transparent"
              color="color2"
              variant="outline"
              border="none"
              _hover={{
                bg: 'color2_50p',
              }}
              display={{ base: 'none !important', md: 'flex !important' }}
              onClick={() => {
                mixpanel.track('community_program_click');
              }}
            >
              ✨ Community Program
            </Button>
          </Link>

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
                    <Center display="flex" alignItems="center" gap=".5rem">
                      <Image
                        src={
                          starkProfile?.profilePicture ||
                          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQa5dG19ABS0ge6iFAgpsvE_ULDUa4fJyT7hg&s'
                        }
                        alt="pfp"
                        width={30}
                        height={30}
                        rounded="full"
                      />{' '}
                      <Text as="h3" marginTop={'3px !important'}>
                        {starkProfile && starkProfile.name
                          ? truncate(starkProfile.name, 6, 6)
                          : shortAddress(address)}
                      </Text>
                    </Center>
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

          {isMobile && (
            <IconButton
              aria-label="Open menu"
              icon={<HamburgerIcon color="color2" height="30px" width="30px" />}
              background="transparent"
              display={{ base: 'flex', md: 'none' }}
              onClick={onOpen}
              _focus={{
                bg: 'none',
              }}
            />
          )}

          <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
            <DrawerOverlay />
            <DrawerContent background="bg">
              <DrawerHeader color="color1_light">Menu</DrawerHeader>
              <DrawerBody>
                <Flex direction="column">
                  <Link href="/" color="color1_light" onClick={onClose}>
                    Home
                  </Link>
                  <Link
                    href="/community"
                    color="color1_light"
                    onClick={() => {
                      onClose();
                      mixpanel.track('community_program_click');
                    }}
                    mt={4}
                  >
                    ✨ Community Program
                  </Link>
                </Flex>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </Flex>
      </Box>
    </Container>
  );
}
