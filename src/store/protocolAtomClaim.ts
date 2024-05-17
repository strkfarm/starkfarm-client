import { getEkubo, getZklend } from "@/services/apiService";
import {  AtomWithQueryResult, atomWithQuery } from "jotai-tanstack-query";
import { atom } from "jotai";
import { addressAtom } from "./claims.atoms";
import { Call } from "starknet";
import { QueryClient } from "@tanstack/query-core";

interface Protocol {
  totalEarned: number;
  totalClaimed: number;
  totalUnclaimed: number;
  calls: Call[]; 
}


const queryClient = new QueryClient();
export const queryClientAtom = atom(queryClient);

export const zklendQueryAtom = atomWithQuery((get) => ({
  queryKey: [get(addressAtom), "zklend"],
  queryFn: getZklend,
  getQueryClient: () => get(queryClientAtom),
  retry: true,
}));


export const ekuboQueryAtom = atomWithQuery((get) => ({
  queryKey: [get(addressAtom), "ekubo"],
  queryFn: getEkubo,
  getQueryClient: () => get(queryClientAtom),
  retry: true,

}));


export const protocolsResult = atom(async (get) => {
  const queryAtoms = [ekuboQueryAtom, zklendQueryAtom];
  const results = await Promise.all(
    queryAtoms.map( (atom) => {
      const data: AtomWithQueryResult<any> | Protocol =  get(atom);
      if (data != null && data?.data != null) {
        return {
          claimed: data.data.totalClaimed.toFixed(2),
          name: data.data.name,
          unclaimed: data.data.totalUnclaimed.toFixed(2),
          earned: data.data.totalEarned.toFixed(2),
        };
      }
      return null; 
    })
  );

  return results.filter((result) => result !== null);
});




export const protocolsDataAtom = atom((get) => {
  const queryAtoms = [ekuboQueryAtom, zklendQueryAtom ];

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
      const protocolData = get(queryAtom)?.data as Protocol;
      if (protocolData) {
        const {
          calls = [],
          totalClaimed = 0,
          totalEarned = 0,
          totalUnclaimed = 0,
        } = protocolData;

        const newCalls = [...acc.calls, ...calls];
        const newTotalClaimed = acc.totalClaimed + totalClaimed;
        const newTotalEarned = acc.totalEarned + totalEarned;
        const newTotalUnclaimed = acc.totalUnclaimed + totalUnclaimed;
        return {
          calls: newCalls,
          totalClaimed: newTotalClaimed,
          totalEarned: newTotalEarned,
          totalUnclaimed: newTotalUnclaimed,
        };
      }
      return acc;
    },
    { calls: [], totalClaimed: 0, totalEarned: 0, totalUnclaimed: 0 }
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
