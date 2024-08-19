'use client';

import {
  Button,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useAccount, useSignTypedData } from '@starknet-react/core';
import axios from 'axios';
import { useEffect, useState } from 'react';

const exampleData = {
  types: {
    StarkNetDomain: [
      { name: 'name', type: 'felt' },
      { name: 'version', type: 'felt' },
      { name: 'chainId', type: 'felt' },
    ],
    Person: [
      { name: 'name', type: 'felt' },
      { name: 'wallet', type: 'felt' },
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'felt' },
    ],
  },
  primaryType: 'Mail',
  domain: {
    name: 'Starknet Mail',
    version: '1',
    chainId: 1,
  },
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
};

function TncPage() {
  const {
    signTypedData,
    isPending,
    data: signatureData,
  } = useSignTypedData(exampleData);
  const { address } = useAccount();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [isSigned, setIsSigned] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await axios.post('/api/tnc/getSignedUser', {
        address,
      });

      if (data.data.user) {
        setIsSigned(true);
      }
    })();
  }, [address]);

  const handleSign = async () => {
    if (isSigned) {
      alert('User already signed');
    } else {
      signTypedData();
      if (signatureData) {
        await axios.post('/api/tnc/signUser', {
          address,
          message: 'I agree to the terms and conditions',
        });
      }
    }
  };

  return !address ? (
    <Button className="w-full">Connect Your Wallet First</Button>
  ) : (
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
              Terms and Conditions
            </Text>

            <Text textAlign="center">
              You agree to STRKFarm terms and conditions as stated in{' '}
              <Link href="#" color="purple" _hover={{ textDecor: 'underline' }}>
                githublink
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
      <Button
        className="w-full"
        onClick={onOpen}
        disabled={!address || isPending}
      >
        {isPending ? <Spinner size="xs" className="h-4 w-4 mr-2" /> : ''}
        Sign Message
      </Button>
    </>
  );
}

export default TncPage;
