import { MY_STORE } from '@/store';
import { atom, PrimitiveAtom } from 'jotai';

// Cache storage
const cache = new Map<string, { data: any; expiry: number }>();

// Define the result type as CustomAtomWithQueryResult
export type CustomAtomWithQueryResult<TData, TError> = {
  data: TData | null;
  error: TError | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  refetch: () => void;
};

// Custom atomWithQuery function with proper result type
export const customAtomWithQuery = <TData, TError = Error>(args: {
  queryFn: () => Promise<TData>;
  queryKey: string;
  ttl?: number; // Time-to-live in ms
}): PrimitiveAtom<CustomAtomWithQueryResult<TData, TError>> => {
  // Base atom which handles the actual fetching logic

  const { queryFn, queryKey, ttl: _ttl } = args;
  const ttl = _ttl || 10000; // Default to 10s
  const getDataFromCache = (): CustomAtomWithQueryResult<TData, TError> => {
    const now = Date.now();

    // Check cache
    const cached = cache.get(queryKey);
    if (cached && cached.expiry > now) {
      return {
        data: cached.data,
        error: null,
        isLoading: false,
        isSuccess: true,
        isError: false,
        refetch, // Placeholder
      };
    }

    // Default state before fetching
    return {
      data: null,
      error: null,
      isLoading: true,
      isSuccess: false,
      isError: false,
      refetch, // Placeholder
    };
  };

  const baseAtom = atom(getDataFromCache());

  async function refetch() {
    console.log('Refetching', queryKey);
    MY_STORE.set(asyncAtom);
  }

  // Async read and mutation of the atom state
  const asyncAtom = atom(null, async (get, set) => {
    try {
      console.log('Fetching', queryKey);
      const result = await queryFn();
      // Cache the result
      const now = Date.now();
      cache.set(queryKey, { data: result, expiry: now + ttl });

      // Update atom state
      console.log('Setting', queryKey);
      set(baseAtom, {
        data: result,
        error: null,
        isLoading: false,
        isSuccess: true,
        isError: false,
        refetch, // Placeholder, will be defined later
      });
    } catch (error: any) {
      // Handle error state
      set(baseAtom, {
        data: null,
        error,
        isLoading: false,
        isSuccess: false,
        isError: true,
        refetch, // Placeholder, will be defined later
      });
    }
  });

  refetch();

  return baseAtom;
};
