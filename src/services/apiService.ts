import CONSTANTS from "@/constants";
import {
  getCallData,
  getABI,
  isRewardClaimed,
  calcZklendRewards,
  calcEkuboRewards,
} from "@/utils/claimRewards";
import axios from "axios";
import { ClaimRewardsProps } from "./types";

interface ZklendReward {
  claim_contract: string;
  proof: any[];
  claim_id: number;
  recipient: string;
  claimed: boolean;
  amount: {
    value: string;
  };
}

interface EkuboReward {
  contract_address: string;
  proof: any[];
  claim: {
    amount: number;
    id: number;
    claimee: string;
  };
}

export const getZklend = async ({ queryKey }: any) => {
  const { data }: { data: ZklendReward[] } = await axios.get(
    `/zklend/api/reward/all/${CONSTANTS.ZKLEND.TEST_ADDRESS}`
  );
  if (data.length > 0) {
    const unclaimedRewards: ZklendReward[] = data.filter(
      (item: any) => item.type === "defispring" && item.claimed != true
    );
    const contracts: ClaimRewardsProps[] = await Promise.all(
      unclaimedRewards.map(async (contract: ZklendReward) => {
        const { claim_contract, claim_id, amount, proof, recipient } = contract;
        const contractWithABI = await getABI(contract.claim_contract);
        return {
          abi: contractWithABI,
          claim_contract,
          proof,
          claim_id,
          claimee: recipient,
          amount: amount.value,
        };
      })
    );

    const { totalEarned, totalClaimed, totalUnclaimed } =
      calcZklendRewards(data);
    let calls = contracts.length > 0 ? getCallData(contracts) : [];
    return { totalEarned, totalClaimed, totalUnclaimed, calls };
  }
  return [];
};

export const getEkubo = async ({ queryKey }: any) => {
  const { data }: { data: EkuboReward[] } = await axios.get(
    `/ekubo/airdrops/${CONSTANTS.EKUBO.TEST_ADDRESS}?token=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`
  );
  if (data.length > 0) {
    const contracts: ClaimRewardsProps[] = await Promise.all(
      data.map(async (contract: EkuboReward) => {
        const { contract_address, claim, proof } = contract;
        const abi = await getABI(contract_address);
        let claimed = await isRewardClaimed({
          claim_id: claim.id,
          abi: abi,
          contract_claim: contract_address,
        });

        return {
          abi: abi,
          claim_contract: contract_address,
          claim_id: claim.id,
          claimee: claim.claimee,
          amount: claim.amount,
          claimed: claimed,
          proof,
        };
      })
    );

    const { totalEarned, totalClaimed, totalUnclaimed } =
      calcEkuboRewards(contracts);

    let unclaimedContracts = contracts.filter((contract) => contract.claimed != true);
    let calls = unclaimedContracts.length > 0 ? getCallData(unclaimedContracts) : [];
    return { totalEarned, totalClaimed, totalUnclaimed, calls };
  }
  return [];
};
