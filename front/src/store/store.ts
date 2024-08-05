import { WalletsListener } from '@massalabs/wallet-provider';
import { create } from 'zustand';
import configStore, {
  BRIDGE_THEME_STORAGE_KEY,
  ConfigStoreState,
} from './configStore';
import modeStore, { ModeStoreState } from './modeStore';
import { useTokenStore } from './tokenStore';
import { LAST_USED_ACCOUNT, _getFromStorage } from '../utils/storage';
import { updateWallet } from './helpers/massaWallets';
import { useAccountStore } from '@massalabs/react-ui-kit';

export { useTokenStore } from './tokenStore';
export { useGlobalStatusesStore } from './globalStatusesStore';

export const useConfigStore = create<ConfigStoreState>((...obj) => ({
  ...configStore(...obj),
}));

export const useModeStore = create<ModeStoreState>((set, get) => ({
  ...modeStore(set, get),
}));

function initConfigStore() {
  let theme = _getFromStorage(BRIDGE_THEME_STORAGE_KEY);
  if (theme) {
    theme = JSON.parse(theme);
    useConfigStore.getState().setTheme(theme);
  } else {
    useConfigStore.getState().setTheme('theme-dark');
  }
}

async function initAccountStore() {
  const providers = await updateWallet();

  const storedAccount = _getFromStorage(LAST_USED_ACCOUNT);
  if (storedAccount) {
    const { provider: lastUsedProvider } = JSON.parse(storedAccount);
    const provider = providers.find((p) => p.name() === lastUsedProvider);
    if (provider) {
      useAccountStore.getState().setCurrentWallet(provider);
    }
  }

  new WalletsListener(2000).subscribe((wallet) => {
    useAccountStore.getState().setWallets(wallet);
  });
}

async function initTokenStore() {
  useTokenStore.getState().getTokens();
}

async function initializeStores() {
  initConfigStore();
  await initAccountStore();
  await initTokenStore();
}

initializeStores();
