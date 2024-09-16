import { gql } from '@apollo/client';
import apolloClient from '@/utils/apolloClient';
import { atomWithQuery } from 'jotai-tanstack-query';

interface HarvestTime {
  contract: string;
  amount: string;
  timestamp: string;
}

interface QueryResponse {
  findManyHarvests: HarvestTime[];
  totalHarvests: number;
  totalStrkHarvested: number;
}

// GraphQL query
const GET_HARVESTS_QUERY = gql`
  query Query(
    $where: HarvestsWhereInput,
    $take: Int,
    $orderBy: [HarvestsOrderByWithRelationInput!],
    $contract: String!,
    $totalStrkHarvestedContract2: String!
  ) {
    findManyHarvests(where: $where, take: $take, orderBy: $orderBy) {
      contract
      amount
      timestamp
    }
    totalHarvests(contract: $contract)
    totalStrkHarvested(contract: $totalStrkHarvestedContract2)
  }
`;

// Function to execute the query
async function getHarvestData(
  contract: string,
  totalStrkHarvestedContract2?: string,
  take: number = 10,
  orderBy: any = [{ timestamp: 'desc' }] // adjust the sort order as needed
): Promise<QueryResponse | null> {
  try {
    const { data } = await apolloClient.query<QueryResponse>({
      query: GET_HARVESTS_QUERY,
      variables: {
        where: {
          contract: {
            equals: contract,
          },
        },
        take,
        orderBy,
        contract,
        totalStrkHarvestedContract2,
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
