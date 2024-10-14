import { useEffect } from 'react';
import { useAccountStore } from '@massalabs/react-ui-kit/src/lib/ConnectMassaWallets';
// TODO - Export in ui-kit
import { useLocalStorage } from '@massalabs/react-ui-kit/src/lib/util/hooks/useLocalStorage';
import { getWallets } from '@massalabs/wallet-provider';

type SavedAccount = {
  address: string;
};

const useAccountSync = () => {
  const {
    connectedAccount,
    setConnectedAccount,
    setCurrentWallet,
    setWallets,
  } = useAccountStore();

  const [savedAccount, setSavedAccount] = useLocalStorage<SavedAccount>(
    'saved-account',
    {
      address: '',
    },
  );

  // Save account and provider to local storage
  useEffect(() => {
    if (!connectedAccount) return;
    const { address } = savedAccount;
    if (address !== connectedAccount.address) {
      setSavedAccount({
        address: connectedAccount.address,
      });
    }
  }, [connectedAccount, savedAccount, setSavedAccount]);

  // Sync account and provider from local storage
  useEffect(() => {
    const { address } = savedAccount;
    if (!address) return;
    if (connectedAccount) return;

    getWallets().then((wallets) => {
      setWallets(wallets);
      for (const wallet of wallets) {
        wallet.accounts().then((accounts) => {
          const acc = accounts.find((a) => a.address === address);
          if (acc) {
            setConnectedAccount(acc);
            setCurrentWallet(wallet);
            return;
          }
        });
      }
    });
  }, [
    savedAccount,
    connectedAccount,
    setConnectedAccount,
    setCurrentWallet,
    setWallets,
  ]);
};

export default useAccountSync;
