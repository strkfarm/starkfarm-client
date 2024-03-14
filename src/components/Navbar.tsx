import { Avatar, Badge, Box, Button, Center, Container, Flex, Link, Menu, MenuButton, MenuItem, MenuList, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger, Portal, Select, Spinner, Text } from "@chakra-ui/react";
import { useAccount } from "@starknet-react/core";
import { ChevronDownIcon } from '@chakra-ui/icons'
import { num } from "starknet";
import tg from '@/assets/tg.svg';
import CONSTANTS from "@/constants";


export default function Navbar() {
    const { address, chainId, status  }  = useAccount();
    // const balances = useAtomValue(balancesAtom);

    function shortString(_address: string) {
        let x = num.toHex(num.getDecimalString(_address))
        return `${x.slice(0, 4)}...${x.slice(x.length - 4, x.length)}`
    }

    return <Container width={'100%'} padding={'0'} borderBottom={'1px solid var(--chakra-colors-color2)'}>
        <Center bg='highlight' color='orange' padding={0}>
            <Text>{""}Lending pools coming soon{""}</Text>
        </Center>
        <Box width={'100%'} maxWidth='1000px' margin={'0px auto'} padding={'20px 20px 10px'}>
            <Flex width={'100%'}>
                <Text fontSize={'35px'}  margin='0 auto 0 0' color={'color2'} letterSpacing={'10px'} textAlign={'left'}><b>STRKFarm</b></Text>
                <Link href={CONSTANTS.COMMUNITY_TG} isExternal>
                    <Button margin='0 0 0 auto' 
                        borderColor='color2' 
                        color='color2' variant='outline' 
                        rightIcon={ <Avatar size='sm' name='TG' src={tg.src} color='red' />}
                        _hover={{
                            bg: 'color2_50p'
                        }}    
                    >
                        Join Telegram
                    </Button>
                </Link>
            {/* <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bgColor={'highlight'} color='light_grey'>
                    <Center>
                        {status == 'connecting' || status == 'reconnecting' ? <Spinner size={'sm'} marginRight={'5px'}/> : <></>} 
                        {status == 'connected' && address ? shortString(address) : ''}
                        {status == 'disconnected' ? 'Connect' : ''}
                    </Center>
                </MenuButton>
                <MenuList>
                    <MenuItem>Disconnect</MenuItem>
                </MenuList>
            </Menu> */}
            </Flex>
        </Box>
    </Container>
}