import { zklendAtom } from "@/store/protocolAtomClaim";
import { useAccount } from "@starknet-react/core";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useProvider } from "@starknet-react/core";
import { getContractABI } from "@/utils/ABI";
import { Console } from "console";

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
						// Fetch contract ABIs for all contracts in claimContracts
						const contractABIs = await Promise.all(
							claimContracts.map(async (contractAddress: string) => {
								try {
									return await getContractABI({
										provider: provider,
										address: contractAddress,
									});
								} catch (error) {
									console.error(
										"Error fetching ABI for contract address:",
										contractAddress,
										error
									);
									return null; // Return null for failed fetches
								}
							})
						);
						console.log(contractABIs, "contract");
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
