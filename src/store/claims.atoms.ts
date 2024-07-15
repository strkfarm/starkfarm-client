import { atom } from 'jotai';

// helps mock a address for testing
// to be used by components that need mocked address, else prefer using `useAccount` hook by `@starknet-react/core`
export const addressAtom = atom<string | undefined>('');
