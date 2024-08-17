import CONSTANTS from '@/constants';
import { StrategyTxProps, monitorNewTxAtom } from '@/store/transactions.atom';
import {
  Box,
  Button,
  ButtonProps,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useAccount, useContractWrite } from '@starknet-react/core';
import { useSetAtom } from 'jotai';
import mixpanel from 'mixpanel-browser';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';
import { isMobile } from 'react-device-detect';
import { TwitterShareButton } from 'react-share';
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
  const { isOpen, onOpen, onClose } = useDisclosure();

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
    <>
      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius=".5rem" maxW="32rem">
          <ModalCloseButton color="#7F49E5" />
          <ModalBody
            backgroundColor="#1A1C26"
            pt="4rem"
            pb="3rem"
            border="1px solid #7F49E5"
            borderRadius=".5rem"
            color="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            gap="1rem"
          >
            <Text textAlign="center" fontSize="1.5rem" fontWeight="bold">
              Thank you for your deposit!
            </Text>

            <Text textAlign="center">
              While your deposit is being processed, if you like STRKFarm, do
              you mind sharing on X (Twitter)
            </Text>

            <Box
              bg="black"
              borderRadius=".5rem"
              px="1rem"
              py=".5rem"
              color="white"
              _hover={{
                opacity: 0.9,
              }}
            >
              <TwitterShareButton
                url={'https://www.strkfarm.xyz/'}
                title={'STRKFarm - The best yield optimizer on Starknet'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.6rem',
                }}
              >
                Share on
                <Image src="/x_logo.png" width={15} height={15} alt="x-logo" />
              </TwitterShareButton>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>

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
              if (props.text.includes('Deposit')) onOpen();
              mixpanel.track('Submitted tx', {
                txHash: tx.transaction_hash,
                address,
              });
            });
          }}
          {...props.buttonProps}
        >
          {isPending && <Spinner size={'sm'} marginRight={'5px'} />}{' '}
          {props.text}
        </Button>
      </Box>
    </>
  );
}
