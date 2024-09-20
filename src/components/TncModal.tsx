'use client';

import { SIGNING_DATA } from '@/constants';
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
import { useAccount } from '@starknet-react/core';
import axios from 'axios';
import React, { SetStateAction } from 'react';

interface TncModalProps {
  isOpen: boolean;
  setIsTncSigned: React.Dispatch<SetStateAction<boolean>>;
  setIsSigningPending: React.Dispatch<SetStateAction<boolean>>;
  onClose: () => void;
}

const TncModal: React.FC<TncModalProps> = ({
  isOpen,
  onClose,
  setIsTncSigned,
  setIsSigningPending,
}) => {
  // const { signTypedDataAsync } = useSignTypedData(SIGNING_DATA);
  const { address, account } = useAccount();

  const handleSign = async () => {
    if (!address || !account) {
      return;
    }

    setIsSigningPending(true);

    const signature = (await account.signMessage(SIGNING_DATA)) as string[];

    if (signature && signature.length > 0) {
      try {
        const res2 = await axios.post('/api/tnc/signUser', {
          address,
          signature: JSON.stringify([signature[1], signature[2]]),
        });

        if (res2.data?.success) {
          onClose();
          setIsTncSigned(true);
        }
      } catch (error) {
        console.error(error);
        setIsSigningPending(false);
      } finally {
        setIsSigningPending(false);
      }
    }

    setIsSigningPending(false);
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
