import { allProtocolInfosAtom, zklendAtom } from "@/store/protocolAtomClaim";
import {
	useAccount,
	useContract,
	useContractWrite,
} from "@starknet-react/core";
import { useAtom } from "jotai";
import { useEffect, useMemo } from "react";
import { useProvider } from "@starknet-react/core";
import { getContractABI } from "@/utils/claimRewards";
import TestAbi from "@/abi/abi.json";

export default function useClaimReward() {
	const { address } = useAccount();
	const [allProtocolInfo, setAllProtocolABIsAtom] =
		useAtom(allProtocolInfosAtom);
	const [{ mutate, status, data }] = useAtom(zklendAtom);
	const { provider } = useProvider();

	useEffect(() => {
		if (data && status) {
			if (data.length > 0) {
				const fetchData = async () => {
					try {
						const contractInfo = await Promise.all(
							data.map(async (info: any) => {
								try {
									// Fetch contract ABIs for all contracts in data
									let abi = await getContractABI({
										provider: provider,
										address: info.claim_contract,
									});

									let contractInfo = {
										abi,
										...info,
									};

									return contractInfo;
								} catch (error) {
									console.error(
										"Error fetching ABI for contract address:",

										error
									);
									return null; // Return null for failed fetches
								}
							})
						);
						setAllProtocolABIsAtom(contractInfo);
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

	const claimAmount = BigInt("1000000000000");
	const { contract } = useContract({
		abi: allProtocolInfo[0]?.abi,
		address: allProtocolInfo[0]?.claim_contract,
	});

	const calls = useMemo(() => {
		if (!address || !contract || allProtocolInfo == null) return [];
		const { claim_id, recipient, amount, proof } = allProtocolInfo[0];
		console.log(claim_id, recipient, amount, proof);
		return contract.populateTransaction["claim"]!(
			{
				id: claim_id,
				claimee: address,
				amount: claimAmount,
			},
			proof
		);
	}, [contract, address, allProtocolInfo]);

	const {
		writeAsync,
		data: rewards,
		isSuccess,
		error,
	} = useContractWrite({
		calls,
	});

	useEffect(() => {
		if (allProtocolInfo.length > 0) {
			writeAsync();
		}
	}, [allProtocolInfo]);

	console.log(allProtocolInfo, "data");

	return {
		handleClaimReward,
	};
}
