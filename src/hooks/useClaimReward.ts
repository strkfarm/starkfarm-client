import { zklendAtom } from "@/store/protocolAtomClaim";
import { useAccount } from "@starknet-react/core";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useProvider } from "@starknet-react/core";
import { getContractABI } from "@/utils/ABI";

export default function useClaimReward() {
  const { address } = useAccount();
  const [{ mutate, status, data }] = useAtom(zklendAtom);
  const { provider } = useProvider();

  useEffect(() => {
    if (data && status) {
      const claimContracts = data.map((item: any) => item.claim_contract);

      if (claimContracts.length > 0) {
        const fetchData = async () => {
          try {
            const contractABIs = await getContractABI({
              provider: provider,
              address: claimContracts[0],
            });

            console.log(contractABIs, "contract ABI")
            
          } catch (error) {
            console.error("Error:", error);
          }
        };

        fetchData();
      }
    }
  }, [data, status]);

  const handleClaimReward = () => {
    mutate({ address });
  };

  return {
    handleClaimReward,
  };
}
