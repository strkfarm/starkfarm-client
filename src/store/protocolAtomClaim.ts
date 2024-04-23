import { getEkuboRewards, getZklendRewards } from "@/services/apiService";
import { atomWithMutation } from "jotai-tanstack-query";
import { atomWithCache } from "jotai-cache";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

interface ClaimContractProps {
	claim_contract: string;
	recipient: string;
	claim_id: number;
	amount: number;
	proof: any[];
	token?: string;
}

export const zklendAtom = atomWithMutation(() => ({
	mutationKey: ["zklendRewards"],
	mutationFn: getZklendRewards,
}));

export const ekuboAtom = atomWithMutation(() => ({
	mutationKey: ["ekuboRewards"],
	mutationFn: getEkuboRewards,
}));

export const protocolsInfoAtom = atom<any[]>([]);
export const totalContractsAtom = atom<number>(0);
export const claimRewardsLoadinAtom = atom<boolean>(false);
export const protocolsContractsAtom = atom<any[]>([]);

export const getProtocolClaimedContracts = atom(async (get) => {
	let protocols = get(protocolsInfoAtom);
	let totalContracts = get(totalContractsAtom);
	let protocolsContracts: ClaimContractProps[] = [];
	protocols.map(async (protocol) => {
		const { name, data } = protocol;
		if (data) {
			if (name === "ekubo") {
				data.forEach((contract: any) => {
					const formattedContract = {
						claim_contract: contract?.contract_address,
						claim_id: contract?.claim?.id,
						amount: contract?.claim?.amount,
						recipient: contract?.claim?.claimee,
						proof: contract?.proof,
					};
					protocolsContracts.push(formattedContract);
				});
			}
			if (name === "zklend") {
				data.forEach((contract: any) => {
					const formattedContract = {
						claim_contract: contract?.claim_contract,
						claim_id: contract?.claim_id,
						amount: contract?.amount?.value,
						recipient: contract?.recipient,
						proof: contract?.proof,
					};
					protocolsContracts.push(formattedContract);
				});
			}
		}
	});

	if (protocolsContracts.length == totalContracts) {
		return protocolsContracts;
	}
	return [];
});
export const claimedRewardsAtom = atomWithStorage("claimedRewardsAtom", 0);
