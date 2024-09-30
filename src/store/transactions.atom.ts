// transaction history stored in local storage
// Also handles tx status popup

import { TOKENS } from '@/constants';
import { capitalize, standariseAddress } from '@/utils';
import MyNumber from '@/utils/MyNumber';
import { Atom, Getter, Setter, atom } from 'jotai';
import toast from 'react-hot-toast';
import { RpcProvider, TransactionExecutionStatus } from 'starknet';
import { StrategyInfo, strategiesAtom } from './strategies.atoms';
import { createAtomWithStorage } from './utils.atoms';
import { atomWithQuery, AtomWithQueryResult } from 'jotai-tanstack-query';
import { gql } from '@apollo/client';
import apolloClient from '@/utils/apolloClient';
import { BalanceResult } from './balance.atoms';

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
    const contractAddrFormatted = standariseAddress(contract);
    const ownerAddrFormatted = standariseAddress(owner);
    const { data } = await apolloClient.query({
      query: gql`
        query Query($where: Investment_flowsWhereInput) {
          findManyInvestment_flows(where: $where) {
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
            equals: contractAddrFormatted,
          },
          owner: {
            equals: ownerAddrFormatted,
          },
        },
      },
      // fetchPolicy: 'network-only'
    });

    return data;
  } catch (error) {
    console.error('GraphQL Error:', error);
    throw error;
  }
}

export const newTxsAtom = atom<TransactionInfo[]>([]);

export const TxHistoryAtom = (
  contract: string,
  owner: string,
  balData: Atom<AtomWithQueryResult<BalanceResult, Error>>,
) =>
  atomWithQuery((get) => ({
    // balData just to trigger a refetch
    queryKey: ['tx_history', { contract, owner }, get(balData)],
    queryFn: async ({ queryKey }: any): Promise<TxHistory> => {
      const [, { contract, owner }] = queryKey;
      const res = await getTxHistory(contract, owner);

      console.log('TxHistoryAtom res', res);
      // add new txs from local cache
      const newTxs = get(newTxsAtom);
      console.log('TxHistoryAtom newTxs', newTxs);
      const allTxs = res.findManyInvestment_flows.concat(
        newTxs.map((tx) => {
          return {
            amount: tx.info.amount.toString(),
            timestamp: Math.round(tx.createdAt.getTime() / 1000),
            type: tx.info.actionType,
            txHash: tx.txHash,
            asset: tx.info.tokenAddr,
            __typename: 'Investment_flows',
          };
        }),
      );

      console.log('TxHistoryAtom', allTxs);
      // remove any duplicate txs by txHash
      const txMap: any = {}; // txHash: boolean
      const txHashes = allTxs.filter((txInfo) => {
        if (txMap[txInfo.txHash]) {
          return false;
        }
        txMap[txInfo.txHash] = true;
        return true;
      });

      console.log('TxHistoryAtom txHashes', txHashes);
      return {
        findManyInvestment_flows: txHashes,
      };
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
  await isTxAccepted(tx.txHash);
  console.log('waitForTransaction done', tx);
  const txs = await get(transactionsAtom);
  tx.status = 'success';
  txs.push(tx);
  set(transactionsAtom, txs);

  let newTxs = get(newTxsAtom);
  const txExists = newTxs.find(
    (t) => t.txHash.toLowerCase() === tx.txHash.toLowerCase(),
  );
  if (!txExists) {
    newTxs = [...newTxs, tx];
    set(newTxsAtom, newTxs);
  }
}

// Somehow waitForTransaction is giving delayed confirmation
// even with 5s retry interval. So, using this function instead
async function isTxAccepted(txHash: string) {
  const provider = new RpcProvider({
    nodeUrl: process.env.NEXT_PUBLIC_RPC_URL,
  });
  let keepChecking = true;
  const maxRetries = 30;
  let retry = 0;
  while (keepChecking) {
    let txInfo: any;
    try {
      txInfo = await provider.getTransactionStatus(txHash);
    } catch (error) {
      console.error('isTxAccepted error', error);
      retry++;
      if (retry > maxRetries) {
        throw new Error('Transaction status unknown');
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
      continue;
    }

    console.debug('isTxAccepted', txInfo);
    if (!txInfo.finality_status || txInfo.finality_status == 'RECEIVED') {
      // do nothing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      continue;
    }
    if (txInfo.finality_status == 'ACCEPTED_ON_L2') {
      if (txInfo.execution_status === TransactionExecutionStatus.SUCCEEDED) {
        keepChecking = false;
        return true;
      }
      throw new Error('Transaction reverted');
    } else if (txInfo.finality_status == 'REJECTED') {
      throw new Error('Transaction rejected');
    } else {
      throw new Error('Transaction status unknown');
    }
  }
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
