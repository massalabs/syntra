/* eslint-disable @typescript-eslint/no-explicit-any */

import { create } from 'zustand';
import { useAccountStore } from '@massalabs/react-ui-kit';
import { CHAIN_ID, MRC20 } from '@massalabs/massa-web3';
import { config } from '@/const/config';
import { MasToken, supportedTokens } from '@/const/assets';
import { Asset } from '@massalabs/react-ui-kit/src/lib/token/models/AssetModel';

export interface TokenStoreState {
  selectedToken?: Asset;
  tokens: Asset[];
  mas: Asset;
  refreshBalances: () => void;
}

export const useTokenStore = create<TokenStoreState>((set, get) => ({
  tokens: supportedTokens,
  mas: MasToken,

  refreshBalances: async () => {
    const { connectedAccount } = useAccountStore.getState();
    if (!connectedAccount) {
      return;
    }

    const { tokens: supportedTokens, mas } = get();

    if (!supportedTokens.length) {
      return;
    }

    const tokens = await Promise.all(
      supportedTokens.map(async (token) => {
        const mrc20 = new MRC20(connectedAccount, token.address);
        const [allowance, balance] = await Promise.all([
          mrc20.allowance(
            connectedAccount.address,
            // TODO: Fix ui-kit chain id
            config[CHAIN_ID.Buildnet.toString()].SchedulerContract,
          ),
          mrc20.balanceOf(connectedAccount.address),
        ]);
        token.allowance = allowance;
        token.balance = balance;
        return token;
      }),
    );

    mas.balance = await connectedAccount.balance(false);

    set({ tokens, mas });
  },
}));
