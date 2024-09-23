/* eslint-disable @typescript-eslint/no-explicit-any */

import { create } from 'zustand';
import { useAccountStore } from '@massalabs/react-ui-kit';
import { MRC20 } from '@massalabs/massa-web3';
import { MasToken, supportedTokens } from '@/const/assets';
import { Asset } from '@massalabs/react-ui-kit/src/lib/token/models/AssetModel';
import { useSchedulerStore } from './scheduler';

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

    const {
      address: schedulerAddress,
      scheduleInfo,
      setScheduleInfo,
    } = useSchedulerStore.getState();

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
          mrc20.allowance(connectedAccount.address, schedulerAddress),
          mrc20.balanceOf(connectedAccount.address),
        ]);
        token.allowance = allowance;
        token.balance = balance;
        if (token.address === scheduleInfo.asset.address) {
          setScheduleInfo('asset', token);
        }
        return token;
      }),
    );

    mas.balance = await connectedAccount.balance(false);

    set({ tokens, mas });
  },
}));
