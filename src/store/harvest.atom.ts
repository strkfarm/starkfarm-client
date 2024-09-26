import { gql } from '@apollo/client';
import apolloClient from '@/utils/apolloClient';
import { atomWithQuery } from 'jotai-tanstack-query';
import { standariseAddress } from '@/utils';

interface HarvestTime {
  contract: string;
  amount: string;
  timestamp: string;
}

interface QueryResponse {
  findManyHarvests: HarvestTime[];
  totalHarvestsByContract: number;
  totalStrkHarvestedByContract: {
    STRKAmount: number;
    USDValue: number;
    rawSTRKAmount: string;
  };
}

// GraphQL query
const GET_HARVESTS_QUERY = gql`
  query Query(
    $where: HarvestsWhereInput
    $take: Int
    $orderBy: [HarvestsOrderByWithRelationInput!]
    $contract: String!
  ) {
    findManyHarvests(where: $where, take: $take, orderBy: $orderBy) {
      contract
      amount
      timestamp
    }
    totalHarvestsByContract(contract: $contract)
    totalStrkHarvestedByContract(contract: $contract) {
      STRKAmount
      USDValue
      rawSTRKAmount
    }
  }
`;

// Function to execute the query
async function getHarvestData(
  contract: string,
  take: number = 1,
  orderBy: any = [{ timestamp: 'desc' }],
): Promise<QueryResponse | null> {
  try {
    const { data } = await apolloClient.query<QueryResponse>({
      query: GET_HARVESTS_QUERY,
      variables: {
        where: {
          contract: {
            equals: standariseAddress(contract),
          },
        },
        take,
        orderBy,
        contract: standariseAddress(contract),
      },
    });

    // Return the data
    return data;
  } catch (error) {
    console.error('Error fetching harvest data:', error);
    return null;
  }
}

export const HarvestTimeAtom = (contract: string) =>
  atomWithQuery((get) => ({
    queryKey: ['harvest_data', contract],
    queryFn: async () => {
      const result = await getHarvestData(contract);
      return result;
    },
  }));
