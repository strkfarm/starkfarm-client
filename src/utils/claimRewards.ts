import { ClaimRewardsProps } from "@/services/types";
import { Contract, Provider, ProviderInterface, constants } from "starknet";
import { ethers } from "ethers";
import { toastError } from "./toastMessage";

export const getABI = async (contractAddress: string) => {
  const provider = new Provider({ nodeUrl: "/rpc-api" });
  const compressedContract = await provider.getClassAt(contractAddress);
  return compressedContract.abi;
};

export const getCallData = (contracts: ClaimRewardsProps[]) => {
  const provider = new Provider({ nodeUrl: "/rpc-api" });
  try {
    const contractCalls = contracts.map((contract) => {
      const { abi, claim_contract, claim_id, claimee, amount, proof } =
        contract;
      const claimContract = new Contract(abi, claim_contract, provider);
      const call = claimContract.populateTransaction.claim(
        {
          id: claim_id,
          claimee: claimee,
          amount: amount,
        },
        proof
      );
      return call;
    });
    return contractCalls;
  } catch (err) {
    toastError({ description: "Please try again, an error occurred" });
    return [];
  }
};

export const getProtocolContractCount = (protocols: any[]) => {
  return protocols.reduce(
    (totalCount, protocol) => totalCount + protocol.data.length,
    0
  );
};

export const calcZklendRewards = (
  data: any[]
): { totalEarned: number; totalClaimed: number; totalUnclaimed: number } => {
  const { formatEther } = ethers;

  const { totalEarned, totalClaimed } = data.reduce(
    (acc, curr) => ({
      totalEarned: acc.totalEarned + parseInt(curr.amount.value, 16),
      totalClaimed: curr.claimed
        ? acc.totalClaimed + parseInt(curr.amount.value, 16)
        : 0,
    }),
    { totalEarned: 0, totalClaimed: 0 }
  );

  const totalUnclaimed = totalEarned - totalClaimed;

  return {
    totalEarned: parseFloat(formatEther(totalEarned.toString())),
    totalClaimed: parseFloat(formatEther(totalClaimed.toString())),
    totalUnclaimed: parseFloat(formatEther(totalUnclaimed.toString())),
  };
};


export const calcEkuboRewards = (
  data: any[]
): { totalEarned: number; totalClaimed: number; totalUnclaimed: number } => {
  const { formatEther } = ethers;

  const { totalEarned, totalClaimed } = data.reduce(
    (acc, curr) => ({
      totalEarned: acc.totalEarned + curr.amount,
      totalClaimed: curr.claimed
        ? acc.totalClaimed + curr.amount
        : 0,
    }),
    { totalEarned: 0, totalClaimed: 0 }
  );
  const totalUnclaimed = totalEarned - totalClaimed;

  return {
    totalEarned: parseFloat(formatEther(totalEarned.toString())),
    totalClaimed: parseFloat(formatEther(totalClaimed.toString())),
    totalUnclaimed: parseFloat(formatEther(totalUnclaimed.toString())),
  };
};


interface EkuboRewardClaimedProps {
  abi: any;
  contract_claim: string;
  claim_id: number;
}

export const isRewardClaimed = async ({
  abi,
  contract_claim,
  claim_id,
}: EkuboRewardClaimedProps): Promise<boolean> => {
  try {
      const provider = new Provider({ nodeUrl: "/rpc-api" });
      const claimed = await new Contract(abi, contract_claim, provider).is_claimed(claim_id);
      return claimed ?? false; 
  } catch (error) {
      console.error("Error:", error);
      return false;
  }
};


