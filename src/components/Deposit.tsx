import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Center,
  Grid,
  GridItem,
  Image as ImageC,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import LoadingWrap from './LoadingWrap';
import { IStrategyActionHook, TokenInfo } from '@/strategies/IStrategy';
import { useERC20Balance } from '@/hooks/useERC20Balance';
import { StrategyInfo } from '@/store/strategies.atoms';
import { useMemo, useState } from 'react';
import MyNumber from '@/utils/MyNumber';
import TxButton from './TxButton';
import { MyMenuItemProps, MyMenuListProps } from '@/utils';
import { useAccount, useProvider } from '@starknet-react/core';
import { ProviderInterface } from 'starknet';
import mixpanel from 'mixpanel-browser';
import { StrategyTxProps } from '@/store/transactions.atom';

interface DepositProps {
  strategy: StrategyInfo;
  // ? If you want to add more button text, you can add here
  // ? @dev ensure below actionType is updated accordingly
  buttonText: 'Deposit' | 'Redeem';
  callsInfo: (
    amount: MyNumber,
    address: string,
    provider: ProviderInterface,
  ) => IStrategyActionHook[];
}

export default function Deposit(props: DepositProps) {
  const { address } = useAccount();
  const { provider } = useProvider();
  const [dirty, setDirty] = useState(false);

  // This is the selected market token
  const [selectedMarket, setSelectedMarket] = useState(
    props.callsInfo(MyNumber.fromZero(), address || '0x0', provider)[0]
      .tokenInfo,
  );

  // This is processed amount stored in MyNumber format and meant for sending tx
  const [amount, setAmount] = useState(
    MyNumber.fromEther('0', selectedMarket.decimals),
  );

  // This is used to store the raw amount entered by the user
  const [rawAmount, setRawAmount] = useState('');

  // use to maintain tx history and show toasts
  const txInfo: StrategyTxProps = useMemo(() => {
    return {
      strategyId: props.strategy.id,
      actionType: props.buttonText == 'Deposit' ? 'deposit' : 'withdraw',
      amount,
      tokenAddr: selectedMarket.token,
    };
  }, [amount, props]);

  // constructs tx calls
  const { calls, actions } = useMemo(() => {
    const actions = props.callsInfo(amount, address || '0x0', provider);
    const hook = actions.find((a) => a.tokenInfo.name === selectedMarket.name);
    if (!hook) return { calls: [], actions };
    return { calls: hook.calls, actions };
  }, [selectedMarket, amount, address, provider]);

  const { balance, isLoading, isError } = useERC20Balance(selectedMarket);

  const maxAmount: MyNumber = useMemo(() => {
    return MyNumber.min(balance, selectedMarket.maxAmount);
  }, [balance, selectedMarket]);

  function BalanceComponent(props: {
    token: TokenInfo;
    strategy: StrategyInfo;
    buttonText: string;
  }) {
    return (
      <Box color={'light_grey'} textAlign={'right'}>
        <Text>Available balance </Text>
        <LoadingWrap
          isLoading={isLoading}
          isError={isError}
          skeletonProps={{
            height: '10px',
            width: '50px',
            float: 'right',
            marginTop: '8px',
            marginLeft: '5px',
          }}
          iconProps={{
            marginLeft: '5px',
            boxSize: '15px',
          }}
        >
          <Tooltip label={balance.toEtherStr()}>
            <b style={{ marginLeft: '5px' }}>
              {balance.toEtherToFixedDecimals(4)}
            </b>
          </Tooltip>
          <Button
            size={'sm'}
            marginLeft={'5px'}
            color="purple"
            bg="highlight"
            padding="0"
            maxHeight={'25px'}
            _hover={{
              bg: 'highlight',
              color: 'color_50p',
            }}
            _active={{
              bg: 'highlight',
              color: 'color_50p',
            }}
            onClick={() => {
              setAmount(maxAmount);
              setRawAmount(maxAmount.toEtherStr());
              mixpanel.track('Chose max amount', {
                strategy: props.strategy.name,
                buttonText: props.buttonText,
                amount: amount.toEtherStr(),
                token: selectedMarket.name,
                maxAmount: maxAmount.toEtherStr(),
                address,
              });
            }}
          >
            [Max]
          </Button>
        </LoadingWrap>
      </Box>
    );
  }

  return (
    <Box>
      <Grid templateColumns="repeat(5, 1fr)" gap={6}>
        <GridItem colSpan={2}>
          <Menu>
            <MenuButton
              as={Button}
              height={'100%'}
              rightIcon={<ChevronDownIcon />}
              bgColor={'highlight'}
              borderColor={'bg'}
              borderWidth={'1px'}
              color="color2Text"
              _hover={{
                bg: 'bg',
              }}
            >
              <Center>
                {/* <ImageC src={selectedMarket.logo.src} alt='' width={'20px'} marginRight='5px'/> */}
                {selectedMarket.name}
              </Center>
            </MenuButton>
            <MenuList {...MyMenuListProps}>
              {actions.map((dep) => (
                <MenuItem
                  key={dep.tokenInfo.name}
                  {...MyMenuItemProps}
                  onClick={() => {
                    if (selectedMarket.name != dep.tokenInfo.name) {
                      setSelectedMarket(dep.tokenInfo);
                      setAmount(new MyNumber('0', dep.tokenInfo.decimals));
                      setDirty(false);
                      setRawAmount('');
                    }
                  }}
                >
                  <Center>
                    <ImageC
                      src={dep.tokenInfo.logo.src}
                      alt=""
                      width={'20px'}
                      marginRight="5px"
                    />{' '}
                    {dep.tokenInfo.name}
                  </Center>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </GridItem>
        <GridItem colSpan={3}>
          <BalanceComponent
            token={selectedMarket}
            strategy={props.strategy}
            buttonText={props.buttonText}
          />
        </GridItem>
      </Grid>

      {/* add min max validations and show err */}
      <NumberInput
        min={0}
        max={parseFloat(maxAmount.toEtherStr())}
        step={parseFloat(selectedMarket.stepAmount.toEtherStr())}
        color={'white'}
        bg={'bg'}
        borderRadius={'10px'}
        onChange={(value) => {
          if (value && Number(value) > 0)
            setAmount(MyNumber.fromEther(value, selectedMarket.decimals));
          else {
            setAmount(new MyNumber('0', selectedMarket.decimals));
          }
          setRawAmount(value);
          setDirty(true);
          mixpanel.track('Enter amount', {
            strategy: props.strategy.name,
            buttonText: props.buttonText,
            amount: amount.toEtherStr(),
            token: selectedMarket.name,
            maxAmount: maxAmount.toEtherStr(),
            address,
          });
        }}
        marginTop={'10px'}
        keepWithinRange={false}
        clampValueOnBlur={false}
        value={rawAmount}
      >
        <NumberInputField
          border={'0px'}
          borderRadius={'10px'}
          placeholder="Amount"
        />
        <NumberInputStepper>
          <NumberIncrementStepper color={'white'} border={'0px'} />
          <NumberDecrementStepper color={'white'} border={'0px'} />
        </NumberInputStepper>
      </NumberInput>
      {amount.isZero() && dirty && (
        <Text marginTop="2px" marginLeft={'7px'} color="red" fontSize={'13px'}>
          Require amount {'>'} 0
        </Text>
      )}
      {amount.compare(maxAmount.toEtherStr(), 'gt') && (
        <Text marginTop="2px" marginLeft={'7px'} color="red" fontSize={'13px'}>
          Amount to be less than {maxAmount.toEtherToFixedDecimals(2)}
        </Text>
      )}

      <Center marginTop={'10px'}>
        <TxButton
          txInfo={txInfo}
          text={`${props.buttonText}: ${amount.toEtherToFixedDecimals(2)} ${selectedMarket.name}`}
          calls={calls}
          buttonProps={{
            isDisabled:
              amount.isZero() || amount.compare(maxAmount.toEtherStr(), 'gt'),
          }}
        />
      </Center>

      <Text
        textAlign="center"
        color="disabled_bg"
        fontSize="12px"
        marginTop="20px"
      >
        No additional fees by STRKFarm
      </Text>
    </Box>
  );
}
