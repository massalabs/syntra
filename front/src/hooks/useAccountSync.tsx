import { useCallback, useEffect, useRef } from 'react';
import { useAccountStore } from '@massalabs/react-ui-kit/src/lib/ConnectMassaWallets';
import { useLocalStorage } from '@massalabs/react-ui-kit/src/lib/util/hooks/useLocalStorage';
import { getWallets } from '@massalabs/wallet-provider';

type SavedAccount = {
  address: string;
  providerName: string;
};

const EMPTY_ACCOUNT: SavedAccount = {
  address: '',
  providerName: '',
};

const useAccountSync = () => {
  const {
    connectedAccount,
    setConnectedAccount,
    setCurrentWallet,
    setCurrentNetwork,
  } = useAccountStore();

  const [savedAccount, setSavedAccount] = useLocalStorage<SavedAccount>(
    'saved-account',
    EMPTY_ACCOUNT,
  );

  const findMatchingAccount = useCallback(async (address: string) => {
    const wallets = await getWallets();
    for (const wallet of wallets) {
      const accounts = await wallet.accounts();
      const matchingAccount = accounts.find((a) => a.address === address);
      if (matchingAccount) {
        return { account: matchingAccount, wallet, wallets };
      }
    }
    return null;
  }, []);

  const setAccountFromSaved = useCallback(async () => {
    if (!savedAccount.address) return;

    const result = await findMatchingAccount(savedAccount.address);
    if (result) {
      const { account, wallet } = result;
      setCurrentWallet(wallet);
      setConnectedAccount(account);
      setCurrentNetwork();
    }
  }, [
    savedAccount.address,
    findMatchingAccount,
    setConnectedAccount,
    setCurrentWallet,
    setCurrentNetwork,
  ]);

  useEffect(() => {
    const shouldUpdateSavedAccount =
      connectedAccount && connectedAccount.address !== savedAccount.address;

    if (shouldUpdateSavedAccount) {
      const { address, providerName } = connectedAccount;
      setSavedAccount({ address, providerName });
    }
  }, [connectedAccount, setSavedAccount, savedAccount.address]);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      setAccountFromSaved();
    }
  }, [setAccountFromSaved]);

  return { setSavedAccount };
};

export default useAccountSync;
