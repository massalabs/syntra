/* eslint-disable @typescript-eslint/no-explicit-any */

import { create } from 'zustand';
import { useAccountStore } from '@massalabs/react-ui-kit';
import { MRC20 } from '@massalabs/massa-web3';
import { config } from '@/const/config';
import { useModeStore } from './mode';
import { supportedTokens } from '@/const/assets';
import { Asset } from '@massalabs/react-ui-kit/src/lib/token/models/AssetModel';

export interface TokenStoreState {
  selectedToken?: Asset;
  tokens: Asset[];
  refreshBalances: () => void;
}

export const useTokenStore = create<TokenStoreState>((set, get) => ({
  tokens: supportedTokens,

  refreshBalances: async () => {
    // TODO: Support for Mas coins
    const { connectedAccount } = useAccountStore.getState();
    if (!connectedAccount) {
      return;
    }

    const { tokens: supportedTokens } = get();

    if (!supportedTokens.length) {
      return;
    }

    const { currentMode } = useModeStore.getState();

    const tokens = await Promise.all(
      supportedTokens.map(async (token) => {
        const mrc20 = new MRC20(connectedAccount, token.address);
        const [accountAllowance, accountBalance] = await Promise.all([
          mrc20.allowance(
            connectedAccount.address,
            config[currentMode].SchedulerContract,
          ),
          mrc20.balanceOf(connectedAccount.address),
        ]);
        token.allowance = accountAllowance;
        token.balance = accountBalance;
        return token;
      }),
    );
    set({ tokens });
  },
}));
