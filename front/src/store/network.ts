/* eslint-disable @typescript-eslint/no-explicit-any */

import { NetworkName } from '@massalabs/massa-web3';
import { create } from 'zustand';

export type AvailableNetwork = 'mainnet' | 'buildnet';

export interface NetworkStoreState {
  network: AvailableNetwork;
  switchNetwork: () => void;
}

export const useDappNetworkStore = create<NetworkStoreState>((set, get) => ({
  network: NetworkName.Mainnet,

  switchNetwork: () => {
    set((state) => ({
      network:
        state.network === NetworkName.Mainnet
          ? NetworkName.Buildnet
          : NetworkName.Mainnet,
    }));
  },

  getNetworkName: () => {
    return get().network === NetworkName.Mainnet ? 'mainnet' : 'buildnet';
  },
}));
