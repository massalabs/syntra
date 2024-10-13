/* eslint-disable @typescript-eslint/no-explicit-any */

import { create } from 'zustand';

type AvailableNetwork = 'mainnet' | 'buildnet';

export interface NetworkStoreState {
  network: AvailableNetwork;
  isMainnet: boolean;
  setNetwork: (network: AvailableNetwork) => void;
  toggleNetwork: () => void;
}

export const useNetworkStore = create<NetworkStoreState>((set) => ({
  network: 'buildnet',
  isMainnet: false,

  setNetwork: (network: AvailableNetwork) => {
    set({ network, isMainnet: network === 'mainnet' });
  },

  toggleNetwork: () => {
    set((state) => ({
      network: state.network === 'mainnet' ? 'buildnet' : 'mainnet',
      isMainnet: !state.isMainnet,
    }));
  },
}));
