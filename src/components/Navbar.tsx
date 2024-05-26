import tg from '@/assets/tg.svg';
import CONSTANTS from '@/constants';
import { addressAtom } from '@/store/claims.atoms';
import { WalletName, lastWalletAtom } from '@/store/utils.atoms';
import {
  MyMenuItemProps,
  MyMenuListProps,
  capitalize,
  shortAddress,
} from '@/utils';
import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Center,
  Container,
  Flex,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { useAccount, useConnect, useDisconnect } from '@starknet-react/core';
import { getStarknet } from 'get-starknet-core';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect } from 'react';

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
      const lastConnector = connectors.find((c) => c.id === lastWallet);
      console.log('lastWallet connected', lastConnector);
      if (!lastConnector)
        console.error('last connector id found, but no connector');
      else {
        connect({ connector: lastConnector });
      }
    }
  }, [lastWallet]);

  useEffect(() => {
    console.log('lastWallet connector', connector?.id);
    if (connector) {
      const id: WalletName = connector.id as WalletName;
      setLastWallet(id);
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
      borderBottom={'1px solid var(--chakra-colors-color2)'}
      position={'fixed'}
      bg="bg"
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
        padding={'20px 20px 10px'}
      >
        <Flex width={'100%'}>
          <Link href="/" margin="0 auto 0 0" textAlign={'left'}>
            <Text
              fontSize={{ base: '20px', sm: '25px', md: '30px' }}
              color={'color2'}
              letterSpacing={'10px'}
              marginTop={{ base: '7px', sm: '3px', md: '0' }}
            >
              <b>STRKFarm</b>
            </Text>
          </Link>
          <Link href={'/claims'} isExternal>
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
          </Link>
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
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
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
              fontSize={{ base: '0.9rem', sm: '1rem' }}
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
                connectors.map((connector) => (
                  <MenuItem
                    {...MyMenuItemProps}
                    key={connector.id}
                    onClick={() => {
                      connect({ connector });
                    }}
                  >
                    {(connector.id === 'braavos' ||
                      connector.id === 'argentX') && (
                      <Avatar
                        src={connector?.icon?.light}
                        size={'2xs'}
                        marginRight={'8px'}
                      />
                    )}
                    {capitalize(connector.id)}
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
