import {
	claimRewardsLoadinAtom,
	claimedRewardsAtom,
	ekuboAtom,
	getProtocolClaimedContracts,
	protocolsContractsAtom,
	protocolsInfoAtom,
	totalContractsAtom,
	zklendAtom,
} from "@/store/protocolAtomClaim";
import {
	useAccount,
	useContractWrite,
	useWaitForTransaction,
} from "@starknet-react/core";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo } from "react";
import { useProvider } from "@starknet-react/core";
import {
	claimRewards,
	getContractABI,
	getProtocolContractCount,
} from "@/utils/claimRewards";
import { toastMessage } from "@/utils/toastMessage";

export default function useClaimReward() {
	const { address } = useAccount();
	const setProtocolsInfo = useSetAtom(protocolsInfoAtom);
	const setTotalContracts = useSetAtom(totalContractsAtom);
	const setClaimedReward = useSetAtom(claimedRewardsAtom);
	const [protocolContracts, setProtocolContracts] = useAtom(
		protocolsContractsAtom
	);
	const protocolClaimedContracts = useAtomValue(getProtocolClaimedContracts);
	const [isLoading, setIsLoading] = useAtom(claimRewardsLoadinAtom);
	const [{ mutate: zklendMutate, data: zklendData }] = useAtom(zklendAtom);
	const [{ mutate: ekuboMutation, data: ekuboData }] = useAtom(ekuboAtom);
	const { provider } = useProvider();

	useEffect(() => {
		if (protocolClaimedContracts) {
			if (protocolClaimedContracts.length > 0) {
				const getABIAndFormatResult = async () => {
					try {
						const contractInfo = await Promise.all(
							protocolClaimedContracts.map(async (info: any) => {
								try {
									let abi = await getContractABI({
										contractAddress: info.claim_contract,
										provider: provider,
									});

									return { abi, ...info };
								} catch (error) {
									setIsLoading(false);
									toastMessage({
										status: "error",
										description: "Unable to get contracts ABI",
									});
								}
							})
						);
						setProtocolContracts(contractInfo);
					} catch (error) {
						setIsLoading(false);
						toastMessage({
							status: "error",
							description: "Unable to get contracts ABI",
						});
					}
				};
				getABIAndFormatResult();
			}
		}
	}, [protocolClaimedContracts]);

	const calls = useMemo(
		() =>
			protocolContracts.length > 0
				? claimRewards({ contracts: protocolContracts, provider })
				: [],
		[protocolContracts]
	);

	const {
		writeAsync,
		data: tx,
		isError,
		isSuccess,
	} = useContractWrite({ calls: calls });

	useEffect(() => {
		if (Array.isArray(calls) && calls.length > 0) {
			// writeAsync();
		}
	}, [calls]);

	const { data: rewards, isLoading: transactionLoading } =
		useWaitForTransaction({
			hash: tx?.transaction_hash,
			watch: true,
			enabled: tx != null && isSuccess && !isError,
		});

	useEffect(() => {
		if (ekuboData && zklendData) {
			const apiProtocols = [
				{ name: "ekubo", data: ekuboData ?? null },
				{ name: "zklend", data: zklendData ?? null },
			];
			setTotalContracts(getProtocolContractCount(apiProtocols));
			setProtocolsInfo(apiProtocols);
		}
	}, [ekuboData, zklendData]);

	const handleClaimReward = () => {
		setIsLoading(true);
		zklendMutate({ address });
		ekuboMutation({ address });
	};

	 useEffect(() => {
		if (!transactionLoading && rewards) {
			setIsLoading(false);
			console.log(rewards.messages_sent, rewards.actual_fee.amount, "claimReward");
			// setClaimedReward(parseInt(rewards.messages_sent.))
			toastMessage({
				status: "success",
				description: "Rewards claimed successfully",
			});
		}
		if (!transactionLoading && isError) {
			setIsLoading(false);
			toastMessage({
				status: "error",
				description: "Unable to claim rewaards. Please try again",
			});
		}
	}, [rewards, transactionLoading, isError]);


	

	return {
		handleClaimReward,
		address,
		isLoading,
	};
}
