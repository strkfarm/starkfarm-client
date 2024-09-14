// transaction history stored in local storage
// Also handles tx status popup

import { TOKENS } from '@/constants';
import { capitalize, standariseAddress } from '@/utils';
import MyNumber from '@/utils/MyNumber';
import { Getter, Setter, atom } from 'jotai';
import toast from 'react-hot-toast';
import { RpcProvider, TransactionExecutionStatus } from 'starknet';
import { StrategyInfo, strategiesAtom } from './strategies.atoms';
import { createAtomWithStorage } from './utils.atoms';
import { atomWithQuery } from 'jotai-tanstack-query';
import { gql } from '@apollo/client';
import apolloClient from '@/utils/apolloClient';

export interface StrategyTxProps {
  strategyId: string;
  actionType: 'deposit' | 'withdraw';
  amount: MyNumber;
  tokenAddr: string;
}

// Standard tx info to be stored in local storage
export interface TransactionInfo {
  txHash: string;
  info: StrategyTxProps; // can add more types of txs in future
  status: 'pending' | 'success' | 'failed';
  createdAt: Date;
}

export interface TxHistory {
  findManyInvestment_flows: {
    amount: string;
    timestamp: number;
    type: string;
    txHash: string;
    asset: string;
    __typename: 'Investment_flows';
  }[];
}

async function getTxHistory(
  contract: string,
  owner: string,
): Promise<TxHistory> {
  try {
    const { data } = await apolloClient.query({
      query: gql`
        query Query(
          $where: Investment_flowsWhereInput
          $skip: Int
          $take: Int
        ) {
          findManyInvestment_flows(where: $where, skip: $skip, take: $take) {
            amount
            timestamp
            type
            txHash
            asset
          }
        }
      `,
      variables: {
        where: {
          contract: {
            equals: contract,
          },
          owner: {
            equals: owner,
          },
        },
        skip: 0,
        take: 10,
      },
    });

    return data;
  } catch (error) {
    console.error('GraphQL Error:', error);
    throw error;
  }
}

export const TxHistoryAtom = (contract: string, owner: string) =>
  atomWithQuery((post) => ({
    queryKey: ['tx_history', { contract, owner }],
    queryFn: async ({ queryKey }: any): Promise<TxHistory> => {
      const [, { contract, owner }] = queryKey;
      const res = await getTxHistory(contract, owner);
      return res;
    },
  }));

// in local storage, objects like Date, MyNumber are stored as strings
// this function deserialises them back to their original types
// declare let localStorage: any;
async function deserialiseTxInfo(key: string, initialValue: TransactionInfo[]) {
  let storedValue;

  if (typeof window !== 'undefined') {
    storedValue = localStorage.getItem(key);
  }

  const txs: TransactionInfo[] = storedValue
    ? JSON.parse(storedValue)
    : initialValue;
  txs.forEach((tx) => {
    if (tx.info.amount) {
      tx.info.amount = new MyNumber(
        tx.info.amount.bigNumber.toString(),
        tx.info.amount.decimals,
      );
    }
    tx.createdAt = new Date(tx.createdAt);
  });
  return txs;
}

// Atom to store tx history in local storage
export const transactionsAtom = createAtomWithStorage<TransactionInfo[]>(
  'transactions',
  [],
  deserialiseTxInfo,
);

// call this func to add a new tx to the tx history
// initiates a toast notification
export const monitorNewTxAtom = atom(
  null,
  async (get, set, tx: TransactionInfo) => {
    console.log('monitorNewTxAtom', tx);
    await initToast(tx, get, set);
  },
);

async function waitForTransaction(
  tx: TransactionInfo,
  get: Getter,
  set: Setter,
) {
  const provider = new RpcProvider({
    nodeUrl: process.env.NEXT_PUBLIC_RPC_URL,
  });
  console.log('waitForTransaction', tx);
  await provider.waitForTransaction(tx.txHash, {
    successStates: [TransactionExecutionStatus.SUCCEEDED],
  });
  console.log('waitForTransaction done', tx);
  const txs = await get(transactionsAtom);
  tx.status = 'success';
  txs.push(tx);
  set(transactionsAtom, txs);
}

async function initToast(tx: TransactionInfo, get: Getter, set: Setter) {
  const msg = StrategyTxPropsToMessage(tx.info, get);
  await toast.promise(
    waitForTransaction(tx, get, set),
    {
      loading: msg,
      error: msg,
      success: msg,
    },
    {
      position: 'bottom-right',
      style: {
        background: 'rgb(127 73 229)',
        color: '#fff',
        fontFamily: 'sans-serif',
        fontSize: '14px',
      },
    },
  );
}

// converts tx props to a human readable message meant to show in a toast
function StrategyTxPropsToMessage(tx: StrategyTxProps, get: Getter) {
  const strategies = get(strategiesAtom);
  return StrategyTxPropsToMessageWithStrategies(tx, strategies);
}

export function StrategyTxPropsToMessageWithStrategies(
  tx: StrategyTxProps,
  strategies: StrategyInfo[],
) {
  const tokenInfo = TOKENS.find(
    (t) => standariseAddress(t.token) === standariseAddress(tx.tokenAddr),
  );
  if (!tokenInfo) {
    throw new Error(`Toast: Token ${tx.tokenAddr} not found`);
  }
  const strategy = strategies.find((s) => s.id === tx.strategyId);
  if (!strategy) {
    throw new Error(`Toast: Strategy ${tx.strategyId} not found`);
  }
  return `${capitalize(tx.actionType)} ${tx.amount.toEtherToFixedDecimals(4)} ${tokenInfo.name} in ${strategy.name}`;
}
