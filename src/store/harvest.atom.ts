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
    $orderBy: [HarvestsOrderByWithRelationInput!]
  ) {
    findManyHarvests(where: $where, take: $take, orderBy: $orderBy) {
      contract
      amount
      timestamp
    }
    totalHarvests
   
  }
`;


// Function to execute the query
async function getHarvestData(
  contract: string,
  take: number = 1,
  orderBy: any = [{ timestamp: 'desc' }] 
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
      
      //Mock Harvest time
      const testContractAddress = "0x20d5fc4c9df4f943ebb36078e703369c04176ed00accf290e8295b659d2cea6"
      const result = await getHarvestData(testContractAddress);
      return result; 

      // const testContractAddress = "0x20d5fc4c9df4f943ebb36078e703369c04176ed00accf290e8295b659d2cea6"
      // const result = await getHarvestData(contract);
      // return result; 
    },
  }));
