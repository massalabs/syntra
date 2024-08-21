import { create } from 'zustand';
import { Mode } from '@/const/config';

export interface ModeStoreState {
  currentMode: Mode;
  availableModes: Mode[];
  isMainnet(): boolean;
  setCurrentMode: (mode: Mode) => void;
}

export const useModeStore = create<ModeStoreState>(
  (
    set: (params: Partial<ModeStoreState>) => void,
    get: () => ModeStoreState,
  ) => ({
    currentMode: Mode.mainnet,
    availableModes: Object.values(Mode),
    isMainnet: () => get().currentMode === Mode.mainnet,

    setCurrentMode: (mode: Mode) => {
      set({ currentMode: mode });
    },
  }),
);
