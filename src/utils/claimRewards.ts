import {
  Contract,
  ProviderInterface,
} from "starknet";

interface ContractABIInterface {
  contractAddress: string;
  provider: ProviderInterface;
}


interface ProtocolClaimedContractInterface {
  contracts: any[];
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






export const getABIAndFormatResult = async ({contracts, provider}: ProtocolClaimedContractInterface) => {
  try {
    const contractInfo = await Promise.allSettled(
      contracts.map( (info: any) => {
        try {
          let abi =  getContractABI({
            contractAddress: info.claim_contract,
            provider: provider,
          });

          return { abi, ...info };
        } catch (error) {
          console.error(
            "Error fetching ABI for contract address:",
            error
          );
          return null;
        }
      })
    );
    return contractInfo
  } catch (error) {
    console.error("Error:", error);
  }
};

interface ClaimRewardsProps {
  contracts: any[];
  provider: ProviderInterface;
}

export const  claimRewards = ({
  contracts,
  provider,
}: ClaimRewardsProps) => {

  const claimContracts = contracts.map((contract) => {
    const { abi, claim_contract, claim_id, recipient, amount, proof } = contract;
    const claimContract = new Contract(abi, claim_contract, provider);
    const call = claimContract.populateTransaction.claim(
      {
        id: claim_id,
        claimee: recipient,
        amount: amount,
      },
      proof
    );

    return call;

  });

  return claimContracts;
};


export const getProtocolContractCount = (protocols: any[]) => {
  return protocols.reduce((totalCount, protocol) => totalCount + protocol.data.length, 0);
};

