import { getZklendRewards } from "@/services/apiService";
import { atomWithMutation } from "jotai-tanstack-query";

export const zklendAtom = atomWithMutation(() => ({
  mutationKey: ["posts"],
  mutationFn: getZklendRewards,
}));
