/* eslint-disable @typescript-eslint/no-explicit-any */

import { create } from 'zustand';

export type AvailableNetwork = 'mainnet' | 'buildnet';

export interface NetworkStoreState {
  network: AvailableNetwork;
  setNetwork: (network: AvailableNetwork) => void;
}

export const useNetworkStore = create<NetworkStoreState>((set) => ({
  network: 'buildnet',

  setNetwork: (network: AvailableNetwork) => {
    set({ network });
  },
}));
