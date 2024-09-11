'use client';

import {
  Button,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { useAccount, useSignTypedData } from '@starknet-react/core';
import axios from 'axios';
import React from 'react';

import { SIGNING_DATA } from '@/constants';

interface TncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TncModal: React.FC<TncModalProps> = ({ isOpen, onClose }) => {
  const { signTypedDataAsync } = useSignTypedData(SIGNING_DATA);
  const { address } = useAccount();

  const handleSign = async () => {
    const res = await signTypedDataAsync();

    if (res && res?.toString().length > 0) {
      onClose();
      await axios.post('/api/tnc/signUser', {
        address,
        message: res?.toString(),
      });
    }
  };

  return (
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
            Terms and Conditions
          </Text>

          <Text textAlign="center">
            You agree to STRKFarm terms and conditions as stated in{' '}
            <Link href="#" color="purple" _hover={{ textDecor: 'underline' }}>
              github link
            </Link>
          </Text>

          <Button
            bg="#7F49E5"
            borderRadius=".5rem"
            px="1rem"
            py=".5rem"
            color="white"
            cursor="pointer"
            _hover={{
              opacity: 0.9,
              backgroundColor: '#7F49E5',
            }}
            onClick={handleSign}
          >
            Agree
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TncModal;
