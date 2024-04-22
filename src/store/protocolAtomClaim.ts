import { getZklendRewards } from "@/services/apiService";
import { atomWithMutation } from "jotai-tanstack-query";
import { atomWithCache } from "jotai-cache";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const zklendAtom = atomWithMutation(() => ({
	mutationKey: ["posts"],
	mutationFn: getZklendRewards,
}));

export const allProtocolInfosAtom = atom<any[]>([]);

export const cachedContractABIAtom = atomWithCache(async (get) => {
	let allProtocolInfo = get(allProtocolInfosAtom);
	return allProtocolInfo;
});

export const claimedRewardsAtom = atomWithStorage("claimedRewardsAtom", 0);
