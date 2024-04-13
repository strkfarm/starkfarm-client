import CONSTANTS, { TokenName } from "@/constants";
import { allPoolsAtomUnSorted } from "@/store/pools";
import { StrategyInfo, strategiesAtom } from "@/store/strategies.atoms";
import { StrategyAction } from "@/strategies/simple.stable.strat";
import { getUnique, getUniqueById } from "@/utils";
import { AddIcon } from "@chakra-ui/icons";
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Avatar, AvatarGroup, Box, Button, Card, CardBody, Center, Container, Flex, HStack, Heading, Link, LinkBox, LinkOverlay, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverTrigger, Skeleton, Stack, Table, TableCaption, TableContainer, Tbody, Td, Text, Th, Thead, Tooltip, Tr, VisuallyHidden, Wrap, WrapItem, useDisclosure } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import React, { useEffect } from "react";
import mixpanel from 'mixpanel-browser';
import { useRouter } from "next/navigation";


export default function Strategies() {
    const allPools = useAtomValue(allPoolsAtomUnSorted);
    const strategies = useAtomValue(strategiesAtom);
    const router = useRouter()

    function DepositButton(strat: StrategyInfo) {
        // const { isOpen, onOpen, onClose } = useDisclosure()
        return <Box>
            <AvatarGroup size='xs' max={2} marginRight={'5px'} float={'left'} visibility={'hidden'} display={{base: 'none', md: 'flex'}}>
                {getUniqueById(strat.actions.map(p => ({id: p.pool.pool.name, logo: p.pool.pool.logos[0]}))).map((p: any) => <Avatar key={p.id} src={p.logo} />)}
                </AvatarGroup>
            <Box float={'left'} marginTop={{base: '7px', md: '15px'}} width={{base: 'calc(100% - 40px)', md: 'calc(100% - 80px)'}} opacity={'0.5'} fontSize={'15px'} fontFamily={'arial'}>{strat.description}</Box>
            <Popover >
                <PopoverTrigger>
                    
                        <Button variant={'solid'} size={'sm'} bg='highlight' color='cyan' float={'right'} 
                            marginTop={'10px'}
                            _hover={{
                                backgroundColor: 'bg'
                            }}
                            onClick={()=> {
                                mixpanel.track('Click one click deposit', {name: strat.name})
                            }}
                        ><AddIcon/></Button>
                </PopoverTrigger>
                <PopoverContent bg='highlight' borderColor={'highlight'}>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverBody marginTop={'20px'}>
                    <Text fontSize={'14px'}>Thanks for showing interest in <b>`One Click Deposit` feature</b>. 
                    We are developing this as you read this message and will be available soon. 
                    The button is to let you know that we will be supporting this soon. 😎</Text>
                    
                    <Text fontSize={'14px'} color='light_grey' marginTop={'10px'}><b>Join our Telegram group to get instant updates. Link on the top.</b></Text>
                    </PopoverBody>
                </PopoverContent>
            </Popover>
      </Box>
    }

    function getStratCard(strat: StrategyInfo) {
        return  <Stack direction={{base: 'column', md: 'row'}} width={'100%'}>
            <LinkBox  width={{base: '100%', md: '70%'}} display={{base: 'flex', md: 'flex'}} onClick={() => {
                mixpanel.track('Strategy expanded', {name: strat.name})
            }}
            ><Box width={'100%'}>
                <AvatarGroup size='xs' max={2} marginRight={'5px'}>
                {getUniqueById(strat.actions.map(p => ({id: p.pool.pool.name, logo: p.pool.pool.logos[0]}))).map((p: any) => <Avatar key={p.id} src={p.logo} />)}
                </AvatarGroup>
                <Box>   
                    <Heading size={{base: 'sm', md: 'md'}} textAlign={'left'} marginBottom={'5px'} fontWeight={'bold'}>
                        <LinkOverlay href={`/strategy?name=${strat.name}`}>{strat.name}</LinkOverlay>
                    </Heading>
                    <Heading fontSize={{base: '12px', md: '14px'}}color='color1_light'> 
                        <Wrap>
                            {getUniqueById(strat.actions.map(p => ({id: p.pool.protocol.name, logo: p.pool.protocol.logo}))).map(p => <WrapItem marginRight={'10px'} key={p.id}>
                                <Center>
                                    <Avatar size='2xs' bg={'black'} src={p.logo} marginRight={'2px'} />
                                    <Text marginTop={'2px'}>{p.id}</Text>
                                </Center>
                            </WrapItem>)}
                        </Wrap>
                    </Heading>
                </Box>
            </Box></LinkBox>
            <Box width={{base: '100%', md: '30%'}} marginTop={{base: '10px', md: '0px'}}>
                <Box width={'100%'} float='left' marginBottom={'5px'}>
                    <Tooltip label="Includes fees & rewards earn from tokens shown. Click to know the investment proceduce.">
                        <Text textAlign={'right'} color='cyan' fontWeight={'bold'} float={{base: 'left', md: 'right'}}>
                            {(strat.netYield*100).toFixed(2)}%
                        </Text>
                    </Tooltip>
                    <AvatarGroup size={{base: '2xs', md: 'xs'}} max={4} spacing={'-6px'} margin={{base: '3px 5px 0', md: '0 5px'}} float={{base: 'left', md: 'right'}}>
                        {strat.rewardTokens.map((token) => <Avatar key={token.logo} src={token.logo} />)}
                    </AvatarGroup>
                </Box>
                <Tooltip label="Multiplier showing the additional reward earned compared to simple deposit">
                    <Text textAlign={{base: 'left', md: 'right'}} width='100%' float={'left'} color='color1_light'>{strat.leverage.toFixed(1)}x higher returns</Text>
                </Tooltip>
            </Box>
            {/* <Stack direction={{base: 'column', md: 'row'}} width={{base: '50%', md: '66%'}}>
            {getAPRWithToolTip(pool)}
            <Text width={{base: '100%', md: '50%'}} textAlign={'right'}>${Math.round(pool.tvl).toLocaleString()}</Text>
            </Stack> */}
        </Stack>
    }
    return <Container width='100%' float={'left'} padding={'0px'} marginTop={'10px'}>
            <Text color='light_grey' fontSize={'13px'} marginBottom={'10px'} fontFamily={'arial'}>Strategies are combination of deposit & borrow actions that combine various pools and risk combinations to maximize yield. 
                We currently have one High yield low risk strategy, and adding more as you read this.</Text>
          <Card variant={'filled'} bg='opacity_50p' color={'purple'} display={{base: 'none', md: 'visible'}}>
            <CardBody paddingTop={'5px'} paddingBottom={'5px'}>
              <HStack width={'100%'}>
                  <Heading width={{base: '70%'}} size='md'>Strategy</Heading>
                  <Stack direction={{base: 'column'}} width={{base: '30%'}}>
                    <Heading width={{base: '100%'}} size='sm' textAlign={'right'}>APR(%)/Leverage</Heading>
                  </Stack>
              </HStack>
            </CardBody>
          </Card>
          {strategies.length > 0 && <Stack spacing='4'>
            {strategies.map((strat, index) => (
            <Card key={`${strat.name}`} variant={'filled'} 
                bg={index % 2 == 0 ? 'color1_50p': 'color2_50p'} color='white'
                _hover={{
                    bg: index % 2 == 0 ? 'color1_65p': 'color2_65p'
                }}
            >
                <CardBody
                    padding={{base: '15px', md: '20px'}}
                >
                    
                    <Box width={'100%'} padding={'0px 10px 0 0'}>
                        {getStratCard(strat)}
                    </Box>
                    {/* {DepositButton(strat)} */}
                </CardBody>
            </Card>
            ))}
          </Stack>}
          {allPools.length > 0 && strategies.length == 0 && <Box padding="10px 0" width={'100%'} float={'left'}>
            <Text color='light_grey' textAlign={'center'}>No strategies. Check back soon.</Text>
          </Box>}
          {allPools.length == 0 && <Stack>
            <Skeleton height='70px' />
          </Stack>}
        </Container>
}