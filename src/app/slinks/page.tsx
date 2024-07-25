'use client';
import { StrategyInfo, strategiesAtom } from "@/store/strategies.atoms";
import { IStrategy } from "@/strategies/IStrategy";
import { Avatar, Box, Button, Card, Container, Flex, Image, Input, Link, Text } from "@chakra-ui/react";
import fulllogo from '@public/fulllogo.png';
import { useAtomValue } from "jotai";
import { Metadata } from "next";

const metadata: Metadata = {
    title: 'STRKFarm | Yield aggregator on Starknet',
    description:
      'Find and invest in high yield pools. STRKFarm is the best yield aggregator on Starknet.',
    openGraph: {
      title: 'STRKFarm | Yield aggregator on Starknet',
      description:
        'Find and invest in high yield pools. STRKFarm is the best yield aggregator on Starknet.',
      images: ['https://static-assets-8zct.onrender.com/strkfarm/preview.png'],
    },
    twitter: {
      title: 'STRKFarm | Best Yields on Starknet',
      description:
        'Find and invest in high yield pools. STRKFarm is the best yield aggregator on Starknet.',
      card: 'player',
      images: ['https://static-assets-8zct.onrender.com/strkfarm/preview.png'],
      site: '@strkfarm',
    },
};

function getCardSimple(strat: StrategyInfo) {
    return <Card key={strat.id} bg='highlight' 
        color='light_grey' 
        padding={'10px'}
        marginBottom={'5px'}
    >
        <Flex justifyContent={'space-between'}>
            <Text fontWeight={'bold'} color='white' fontSize={'16px'}>
                <Avatar src={strat.holdingTokens[0].logo} size='xs' marginRight={'5px'}/>
                {strat.name}
            </Text>
            <Box>
                <Text fontSize={'13px'}>Bal: 10 STRK</Text>
            </Box>
        </Flex>
        <Flex justifyContent={'space-between'} marginTop={'15px'}>
            <Input bg='bg' borderWidth={'0'} size={'sm'} 
                float={'right'}
                borderRadius={'5px'}
                marginRight={'10px'}
            placeholder="Amount"/>
            <Button size='sm' bg='purple' color='white' float={'right'}>Deposit</Button>
        </Flex>
    </Card>
}

export default function Slinks() {
    const strategies = useAtomValue(strategiesAtom);
    return <Container>
        <Text color={'white'}>Choose a strategy and invest</Text>
        {strategies.filter(s => s.isLive()).map(strat => getCardSimple(strat))}
    </Container>
}