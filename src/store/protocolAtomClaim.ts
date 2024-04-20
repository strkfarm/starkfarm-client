import { getZklendRewards } from "@/services/apiService";
import { atomWithMutation } from "jotai-tanstack-query";
import { atomWithCache } from "jotai-cache";
import { atom } from "jotai";

export const zklendAtom = atomWithMutation(() => ({
	mutationKey: ["posts"],
	mutationFn: getZklendRewards,
}));

export const allProtocolInfosAtom = atom<any[]>([]);

export const cachedContractABIAtom = atomWithCache(async (get) => {
	let allProtocolInfo = get(allProtocolInfosAtom);
	return allProtocolInfo;
});
