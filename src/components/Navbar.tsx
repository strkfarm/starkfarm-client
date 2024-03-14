import { Badge, Box, Button, Center, Container, Flex, Menu, MenuButton, MenuItem, MenuList, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger, Portal, Select, Spinner, Text } from "@chakra-ui/react";
import { useAccount } from "@starknet-react/core";
import { ChevronDownIcon } from '@chakra-ui/icons'
import { num } from "starknet";


export default function Navbar() {
    const { address, chainId, status  }  = useAccount();
    // const balances = useAtomValue(balancesAtom);

    function shortString(_address: string) {
        let x = num.toHex(num.getDecimalString(_address))
        return `${x.slice(0, 4)}...${x.slice(x.length - 4, x.length)}`
    }

    return <Container width={'100%'} padding={'20px 20px 10px'}>
        <Center marginLeft={'auto'}>
            <Text fontSize={'35px'} color={'purple'} letterSpacing={'10px'}><b>🚀Starknet DeFi Spring</b></Text>
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
        </Center>
    </Container>
}