import { atomWithStorage, createJSONStorage } from "jotai/utils";

const ISSERVER = typeof window === "undefined";
declare let localStorage: any;
export const addressAtom = atomWithStorage<string | undefined>(
	"address",
	undefined,
	{
		...createJSONStorage(() => {
			if (!ISSERVER) return localStorage;
			return null;
		}),
	},
	{
		getOnInit: true,
	}
);
