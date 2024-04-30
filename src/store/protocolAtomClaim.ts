import { getEkubo, getZklend } from "@/services/apiService";
import { atomWithMutation, atomWithQuery } from "jotai-tanstack-query";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { addressAtom } from "./claims.atoms";
import { Call } from "starknet";

interface Protocol {
  totalEarned: number;
  totalClaimed: number;
  totalUnclaimed: number;
  calls: Call[]; 
}

export const zklendQueryAtom = atomWithQuery((get) => ({
  queryKey: [get(addressAtom)],
  queryFn: getZklend,
  retry: true,
}));

export const ekuboQueryAtom = atomWithQuery((get) => ({
  queryKey: [get(addressAtom)],
  queryFn: getEkubo,
  retry: true,
}));

export const protocolsDataAtom = atom((get) => {
  const queryAtoms = [ekuboQueryAtom, zklendQueryAtom];

  return queryAtoms.reduce(
    (
      acc: {
        calls: Call[];
        totalClaimed: number;
        totalEarned: number;
        totalUnclaimed: number;
      },
      queryAtom
    ) => {
      const {
        calls = [],
        totalClaimed = 0,
        totalEarned = 0,
        totalUnclaimed = 0,
      } = (get(queryAtom)?.data as Protocol) ?? {};


      return {
        calls: [...acc.calls, ...calls],
        totalClaimed: acc.totalClaimed + totalClaimed,
        totalEarned: acc.totalEarned + totalEarned,
        totalUnclaimed: acc.totalUnclaimed + totalUnclaimed,
      };
    },
    { calls: [], totalClaimed: 0, totalEarned: 0, totalUnclaimed: 0 } as {
      calls: Call[];
      totalClaimed: number;
      totalEarned: number;
      totalUnclaimed: number;
    }
  );
});

export const callsAtom = atom((get) => {
  const { calls } = get(protocolsDataAtom);
  return calls;
});

export const rewardsAtom = atom((get) => {
  const { totalEarned, totalClaimed, totalUnclaimed } = get(protocolsDataAtom);
  return { totalEarned, totalClaimed, totalUnclaimed };
});
