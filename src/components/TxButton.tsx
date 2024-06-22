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

  const { writeAsync, data, status, isSuccess, isPending } = useContractWrite({
    calls: props.calls,
  });

  useEffect(() => {
    console.log('status', isPending, status, isSuccess, data);
    if (data && data.transaction_hash) {
      console.log('txHash', data.transaction_hash);
      // initiates a toast and adds the tx to tx history if successful
      monitorNewTx({
        txHash: data.transaction_hash,
        info: props.txInfo,
        status: 'pending', // 'success' | 'failed'
        createdAt: new Date(),
      });
    }
  }, [status, data]);

  const disabledText = useMemo(() => {
    if (isMobile) return CONSTANTS.MOBILE_MSG;
    if (!address) return 'Wallet not connected';
    return '';
  }, [isMobile, address]);

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
