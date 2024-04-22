import {
  allProtocolInfosAtom,
  claimedRewardsAtom,
  zklendAtom,
} from "@/store/protocolAtomClaim";
import {
  useAccount,
  useContractWrite,
  useWaitForTransaction,
} from "@starknet-react/core";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { useProvider } from "@starknet-react/core";
import { claimRewards, getContractABI } from "@/utils/claimRewards";
import { ethers } from "ethers";
import mixpanel from "mixpanel-browser";

export default function useClaimReward() {
  const { address } = useAccount();
  const [allProtocolInfo, setAllProtocolABIsAtom] =
    useAtom(allProtocolInfosAtom);
  const setClaimedReward = useSetAtom(claimedRewardsAtom);
  const [{ mutate, status, data }] = useAtom(zklendAtom);
  const { provider } = useProvider();
  const [calls, setCalls] = useState<any>([]);

  useEffect(() => {
    if (data && status) {
      if (data.length > 0) {
        const getABIAndFormatResult = async () => {
          try {
            const contractInfo = await Promise.all(
              data.map(async (info: any) => {
                try {
                  let abi = await getContractABI({
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
            setAllProtocolABIsAtom(contractInfo);
          } catch (error) {
            console.error("Error:", error);
          }
        };
        getABIAndFormatResult();
      }
    }
  }, [data, status]);

  const handleClaimReward = () => {
    mutate({ address });
  };

  useEffect(() => {
    if (allProtocolInfo.length > 0) {
      let calls = claimRewards({
        contracts: allProtocolInfo,
        provider: provider,
      });

      setCalls(calls);
    }
  }, [allProtocolInfo]);

  const { writeAsync, data: tx } = useContractWrite({ calls: calls[0] });

  useEffect(() => {
    if (calls.length > 0) {
      writeAsync();
    }
  }, [calls]);

  const { data: rewards, isLoading } = useWaitForTransaction({
    hash: tx?.transaction_hash,
    watch: true,
    enabled: tx != null,
  });

  useEffect(() => {
    if (rewards) {
      mixpanel.track('Rewards claimed successfully')
      let value = parseInt(rewards.actual_fee.amount);
      setClaimedReward(value);
    }
  }, [rewards]);




  return {
    handleClaimReward,
    address,
    isLoading,
  };
}
