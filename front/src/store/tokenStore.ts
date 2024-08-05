/* eslint-disable @typescript-eslint/no-explicit-any */

import { create } from 'zustand';
import { getMASSASymbol } from './helpers/tokenSymbol';

import {
  getAllowance,
  getMassaTokenSymbol,
  getDecimals,
  getMassaTokenName,
  getBalance,
} from '@/custom/token/token';
import {
  SELECTED_MASSA_TOKEN_KEY,
  _getFromStorage,
  _setInStorage,
} from '@/utils/storage';
import { config } from '@/const/modes';
import { tokenList } from '@/const/tokens';
import { useAccountStore } from '@massalabs/react-ui-kit';
import { useModeStore } from './store';

export interface IToken {
  name: string;
  allowance: bigint;
  decimals: bigint;
  symbol: string;
  address: string;
  chainId: number;
  balance: bigint;
}

export interface TokenStoreState {
  selectedToken?: IToken;
  tokens: IToken[];

  setSelectedToken: (token?: IToken) => void;
  getTokens: () => void;
  refreshBalances: () => void;
}

export const useTokenStore = create<TokenStoreState>((set, get) => ({
  selectedToken: undefined,
  tokens: [],

  getTokens: async () => {
    // const { connectedAccount: account } = useAccountStore.getState();
    // if (!account) {
    //   return;
    // }
    // let list: IToken[] = [];
    // try {
    //   list = await Promise.all(
    //     tokenList.map(async (token) => {
    //       const [name, symbol, decimals] = await Promise.all([
    //         getMassaTokenName(token.address, account),
    //         getMassaTokenSymbol(token.address, account),
    //         getDecimals(token.address, account),
    //       ]);
    //       console.log('name', name);
    //       console.log('symbol', symbol);
    //       console.log('decimals', decimals);
    //       return {
    //         ...token,
    //         name,
    //         symbol: getMASSASymbol(symbol),
    //         decimals,
    //         allowance: BigInt(0),
    //         balance: BigInt(0),
    //       };
    //     }),
    //   );
    //   console.log(list);
    // } catch (e) {
    //   console.warn('unable to get supported tokens list', e);
    // }
    // console.log(list);
    // const storedToken = _getFromStorage(SELECTED_MASSA_TOKEN_KEY)
    //   ? JSON.parse(_getFromStorage(SELECTED_MASSA_TOKEN_KEY))
    //   : undefined;
    // const selectedToken = tokenList.find(
    //   (token) => token.address === storedToken?.address,
    // );
    // set({ tokens: list });
    // get().refreshBalances();
    // if (selectedToken) {
    //   get().setSelectedToken(selectedToken);
    // } else {
    //   get().setSelectedToken(tokenList[0]);
    // }
  },

  setSelectedToken: (selectedToken?: IToken) => {
    set({ selectedToken });
    _setInStorage(
      SELECTED_MASSA_TOKEN_KEY,
      selectedToken ? JSON.stringify(selectedToken) : '',
    );
  },

  refreshBalances: async () => {
    const { connectedAccount } = useAccountStore.getState();
    if (!connectedAccount) {
      return;
    }

    const { tokens: supportedTokens } = get();

    if (!supportedTokens.length) {
      // token list not fetched yet
      return;
    }

    const { currentMode } = useModeStore.getState();

    const tokens = await Promise.all(
      supportedTokens.map(async (token) => {
        const [accountAllowance, accountBalance] = await Promise.all([
          getAllowance(
            config[currentMode].massaSchedulerContract,
            token.address,
            connectedAccount,
          ),
          getBalance(token.address, connectedAccount),
        ]);
        token.allowance = accountAllowance;
        token.balance = accountBalance;
        return token;
      }),
    );
    set({ tokens });
  },
}));
