import { getZklendRewards } from "@/services/apiService";
import { atomWithQuery } from "jotai-tanstack-query";
import { addressAtom } from "./claims.atoms";

export const zklendAtom = atomWithQuery((get) => {
	return {
		queryKey: ["zklend", get(addressAtom)],
		queryFn: getZklendRewards,
	};
});
