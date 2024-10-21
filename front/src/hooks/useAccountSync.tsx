import { useCallback, useEffect } from 'react';
import { useAccountStore } from '@massalabs/react-ui-kit/src/lib/ConnectMassaWallets';
// TODO - Export in ui-kit
import { useLocalStorage } from '@massalabs/react-ui-kit/src/lib/util/hooks/useLocalStorage';
import { getWallets } from '../../../../wallet-provider';

type savedAccount = {
  address: string;
  providerName: string;
};

const useAccountSync = () => {
  const {
    connectedAccount,
    setConnectedAccount,
    setCurrentWallet,
    setWallets,
  } = useAccountStore();

  const [savedAccount, setSavedAccount] = useLocalStorage<savedAccount>(
    'saved-account',
    {
      address: '',
      providerName: '',
    },
  );

  const updateConnectedAccount = useCallback(async () => {
    if (savedAccount && !connectedAccount) {
      const { address } = savedAccount;
      if (!address) return;
      const wallets = await getWallets();
      for (const wallet of wallets) {
        const accounts = await wallet.accounts();
        const acc = accounts.find((a) => a.address === address);
        if (acc) {
          setConnectedAccount(acc);
          setCurrentWallet(wallet);
          setWallets(wallets);
          return;
        }
      }
    }
  }, [
    savedAccount,
    connectedAccount,
    setConnectedAccount,
    setCurrentWallet,
    setWallets,
  ]);

  useEffect(() => {
    if (connectedAccount) return;
    // updateConnectedAccount();
  }, [
    savedAccount,
    connectedAccount,
    setConnectedAccount,
    setCurrentWallet,
    updateConnectedAccount,
  ]);

  return { setSavedAccount };
};

export default useAccountSync;
