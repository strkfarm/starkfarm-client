import {
  Account,
  CallData,
  Contract,
  Provider,
  ProviderInterface,
  constants,
} from "starknet";

interface ContractABIInterface {
  contractAddress: string;
  provider: ProviderInterface;
}

export const getContractABI = async ({
  contractAddress,
  provider,
}: ContractABIInterface) => {
  try {
    const compressedContract = await provider.getClassAt(contractAddress);
    return compressedContract.abi;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

interface ClaimRewardsProps {
  contracts: any[];
  provider: ProviderInterface;
}

export const claimRewards = ({
  contracts,
  provider,
}: ClaimRewardsProps) => {

  const claimContracts = contracts.map((contract) => {
    const { abi, claim_contract, claim_id, recipient, amount, proof } = contract;
    const claimContract = new Contract(abi, claim_contract, provider);
    const call = claimContract.populateTransaction["claim"]!(
      {
        id: claim_id,
        claimee: recipient,
        amount: amount?.value,
      },
      proof
    );

    return call;
  });

  return [claimContracts];
};
