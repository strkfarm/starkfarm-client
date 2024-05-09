/* eslint-disable @next/next/no-img-element */
import {
  Avatar,
  Box,
  Button,
  Center,
  Container,
  Flex,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { useAccount, useConnect, useDisconnect } from '@starknet-react/core';
import { ChevronDownIcon } from '@chakra-ui/icons';
import CONSTANTS from '@/constants';
import { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { addressAtom } from '@/store/claims.atoms';
import {
  capitalize,
  shortAddress,
  MyMenuListProps,
  MyMenuItemProps,
} from '@/utils';
import { getStarknet } from 'get-starknet-core';
import { WalletName, lastWalletAtom } from '@/store/utils.atoms';

export default function Navbar() {
  const { address, chainId, status, connector } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect, disconnectAsync } = useDisconnect();
  const setAddress = useSetAtom(addressAtom);
  const [lastWallet, setLastWallet] = useAtom(lastWalletAtom);
  const getStarknetResult = getStarknet();

  useEffect(() => {
    console.log('lastWallet', lastWallet);
    if (!address && lastWallet) {
      const lastConnector = connectors.find((c) => c.name === lastWallet);
      console.log('lastWallet connected', lastConnector);
      if (!lastConnector)
        console.error('last connector name found, but no connector');
      else {
        connect({ connector: lastConnector });
      }
    }
  }, [lastWallet]);

  useEffect(() => {
    console.log('lastWallet connector', connector?.name);
    if (connector) {
      const name: WalletName = connector.name as WalletName;
      setLastWallet(name);
    }
  }, [connector]);

  useEffect(() => {
    console.log('lastWallet stats', {
      address,
      status,
      connector,
    });
  }, [address, status, connector]);

  return (
    <Container
      width={'100%'}
      padding={'0'}
      borderBottom={'1px solid #272932'}
      position={'fixed'}
      bg="#020612"
      zIndex={10000}
      top="0"
    >
      <Center bg="highlight" color="orange" padding={0}>
        <Text fontSize="12px" textAlign={'center'} padding="0px 5px">
          {''}
          <b>Alpha version, report bugs in our Telegram group.</b>
          {''}
        </Text>
      </Center>
      <Box
        width={'100%'}
        maxWidth="1400px"
        margin={'0px auto'}
        padding={'20px 20px 20px'}
      >
        <Flex display={'flex'} alignItems={'center'} width={'100%'}>
          <Link href="/" margin="0 auto 0 0" textAlign={'left'}>
            <Box marginTop={{ base: '7px', sm: '3px', md: '0' }}>
              <Flex alignItems={'center'} gap={2}>
                <img
                  src={'/favicon.png'}
                  width={'30px'}
                  height={'30px'}
                  alt={'Logo'}
                />
                <img
                  src={'/strk-text-logo.png'}
                  width={'120px'}
                  height={'120px'}
                  alt={'Logo'}
                />
              </Flex>
            </Box>
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
          <Link href={CONSTANTS.COMMUNITY_TG} isExternal>
            <Button
              display={'flex'}
              justifyContent={'center'}
              alignItems={'center'}
              color={'white'}
              borderRadius={'10px'}
              bg={'#272932'}
              _hover={'none'}
              fontSize={{ base: 'small' }}
              _activeLink={'none'}
              _active={'none'}
            >
              Join Telegram
            </Button>
          </Link>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              bgColor={'purple'}
              color="white"
              fontSize={{ base: 'small' }}
              borderColor={'purple'}
              _hover={{
                bg: 'bg',
                borderColor: 'purple',
                borderWidth: '1px',
                color: 'purple',
              }}
              _active={{
                bg: 'bg',
                borderColor: 'purple',
                borderWidth: '1px',
                color: 'purple',
              }}
              marginLeft={'10px'}
              display={{ base: 'none', sm: 'flex' }}
            >
              <Center>
                {status === 'connecting' || status === 'reconnecting' ? (
                  <Spinner size={'sm'} marginRight={'5px'} />
                ) : (
                  <></>
                )}
                {status === 'connected' && address ? shortAddress(address) : ''}
                {status === 'disconnected' ? 'Connect' : ''}
              </Center>
            </MenuButton>
            <MenuList {...MyMenuListProps}>
              {/* connectors */}
              {status !== 'connected' &&
                connectors.map((conn) => (
                  <MenuItem
                    {...MyMenuItemProps}
                    key={conn.name}
                    onClick={() => {
                      connect({ connector: conn });
                    }}
                  >
                    <Avatar
                      src={conn.icon.light}
                      size={'2xs'}
                      marginRight={'5px'}
                    />
                    {capitalize(conn.name)}
                  </MenuItem>
                ))}

              {/* disconnect buttons  */}
              {status === 'connected' && address && (
                <MenuItem
                  key="disconnect"
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
        </Flex>
      </Box>
    </Container>
  );
}
