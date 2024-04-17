import { zklendAtom } from "@/store/protocolAtomClaim";
import { useAtom } from "jotai";

export default function useClaimReward() {
	const [{ data, isPending, isError }] = useAtom(zklendAtom);
	console.log(data, "Pending");

	return {};
}
