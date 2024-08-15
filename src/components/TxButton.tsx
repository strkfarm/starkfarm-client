import CONSTANTS from '@/constants';
import { StrategyTxProps, monitorNewTxAtom } from '@/store/transactions.atom';
import { Box, Button, ButtonProps, Spinner } from '@chakra-ui/react';
import { useAccount, useContractWrite } from '@starknet-react/core';
import { useSetAtom } from 'jotai';
import mixpanel from 'mixpanel-browser';
import { useEffect, useMemo } from 'react';
import { isMobile } from 'react-device-detect';
import { Call } from 'starknet';

interface TxButtonProps {
  txInfo: StrategyTxProps;
  text: string;
  calls: Call[];
  buttonProps: ButtonProps;
  justDisableIfNoWalletConnect?: boolean;
}

export default function TxButton(props: TxButtonProps) {
  const { address } = useAccount();
  const monitorNewTx = useSetAtom(monitorNewTxAtom);
  const disabledStyle = {
    bg: 'var(--chakra-colors-disabled_bg)',
    color: 'var(--chakra-colors-disabled_text)',
    borderColor: 'var(--chakra-colors-disabled_bg)',
    borderWidth: '1px',
  };

  const { writeAsync, data, status, isSuccess, isPending, error, isError } =
    useContractWrite({
      calls: props.calls,
    });

  useEffect(() => {
    console.log(
      'TxButton status',
      isPending,
      status,
      isSuccess,
      data,
      error,
      isError,
    );
    if (data && data.transaction_hash) {
      console.log('TxButton txHash', data.transaction_hash);
      // initiates a toast and adds the tx to tx history if successful
      monitorNewTx({
        txHash: data.transaction_hash,
        info: props.txInfo,
        status: 'pending', // 'success' | 'failed'
        createdAt: new Date(),
      });
    }

    if (isSuccess && data && data.transaction_hash) {
      mixpanel.track('Transaction success', {
        info: props.txInfo,
        status: 'success',
        createdAt: new Date(),
      });
    }

    if (isError && error) {
      mixpanel.track('Transaction failed', {
        info: props.txInfo,
        status: 'failed',
        createdAt: new Date(),
      });
    }
  }, [status, data]);

  // useEffect(() => {
  //   console.log('TxButton props calls', props.calls);
  // }, [props])

  const disabledText = useMemo(() => {
    if (props.justDisableIfNoWalletConnect) {
      if (!address) return props.text;
      return '';
    }
    if (isMobile) return CONSTANTS.MOBILE_MSG;
    if (!address) return 'Wallet not connected';
    return '';
  }, [isMobile, address, props]);

  if (disabledText) {
    return (
      <Button
        _disabled={{
          ...disabledStyle,
        }}
        _hover={{
          ...disabledStyle,
        }}
        _active={{
          ...disabledStyle,
        }}
        isDisabled={true}
        width={'100%'}
        {...props.buttonProps}
      >
        {disabledText}
      </Button>
    );
  }

  return (
    <Box width={'100%'} textAlign={'center'}>
      <Button
        color={'white'}
        bg="purple"
        variant={'ghost'}
        width={'100%'}
        _active={{
          bg: 'var(--chakra-colors-color2)',
        }}
        _hover={{
          bg: 'var(--chakra-colors-color2)',
        }}
        onClick={() => {
          mixpanel.track('Click strategy button', {
            buttonText: props.text,
            address,
          });
          writeAsync().then((tx) => {
            mixpanel.track('Submitted tx', {
              txHash: tx.transaction_hash,
              address,
            });
          });
        }}
        {...props.buttonProps}
      >
        {isPending && <Spinner size={'sm'} marginRight={'5px'} />} {props.text}
      </Button>
    </Box>
  );
}
