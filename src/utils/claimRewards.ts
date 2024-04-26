import { ClaimRewardsProps } from "@/services/types";
import { Contract, Provider, ProviderInterface, constants } from "starknet";
import { toastMessage } from "./toastMessage";
import { ethers } from "ethers";

export const getABI = async (contractAddress: string) => {
	const provider = new Provider({ nodeUrl: "/rpc-api" });
	const compressedContract = await provider.getClassAt(contractAddress);
	return compressedContract.abi;
};

export const getCallsData = (contracts: ClaimRewardsProps[]) => {
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
		toastMessage({
			status: "error",
			description: "unable to populate call data",
		});
		return [];
	}
};

export const getProtocolContractCount = (protocols: any[]) => {
	return protocols.reduce(
		(totalCount, protocol) => totalCount + protocol.data.length,
		0
	);
};

export const calzklendRewards = (
	data: any[]
): { totalEarned: number; totalClaimed: number; totalUnclaimed: number } => {
	const { formatEther } = ethers;

	const { totalEarned, totalClaimed } = data.reduce((acc, curr) => ({
			totalEarned: acc.totalEarned + parseInt(curr.amount.value, 16),
			totalClaimed: curr.claimed ? acc.totalClaimed + parseInt(curr.amount.value, 16) : 0
	}), { totalEarned: 0, totalClaimed: 0 });


	const totalUnclaimed = totalEarned - totalClaimed;

	return {
			totalEarned: parseFloat(formatEther(totalEarned.toString())),
			totalClaimed: parseFloat(formatEther(totalClaimed.toString())),
			totalUnclaimed: parseFloat(formatEther(totalUnclaimed.toString()))
	};
};





export const calTotalEarned = (data: any[]): number => {
	return data
		.map((item) => Number(ethers.formatEther(item.claim.amount)))
		.reduce((acc, curr) => acc + curr, 0);
};



export const isEkuboRewardClaimed = async ({
	abi,
	contract,
	address,
	id,
}: {
	abi: any;
	contract: string;
	address: string;
	id: number;
}): Promise<boolean> => {
	const provider = new Provider({ nodeUrl: "/rpc-api" });
	const claimContract = new Contract(abi, contract, provider);
	const call = claimContract.populateTransaction.is_claimed(id);
	const { transaction_hash: txH, data } = await claimContract.execute(call, {
		version: 3,
	});
	console.log(data, "from transaction");
	return false;
};
