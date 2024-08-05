import { useEffect } from 'react';
import { useAccountStore } from '@massalabs/react-ui-kit/src/lib/ConnectMassaWallets';
// TODO - Export in ui-kit
import { useLocalStorage } from '@massalabs/react-ui-kit/src/lib/util/hooks/useLocalStorage';

type SavedAccount = {
  provider: string;
  account: string;
};

const useAccountSync = () => {
  const {
    wallets,
    currentWallet,
    connectedAccount,
    setCurrentWallet,
    setConnectedAccount,
  } = useAccountStore();

  const [savedAccount, setSavedAccount] = useLocalStorage<SavedAccount>(
    'saved-account',
    {
      provider: '',
      account: '',
    },
  );

  // Save account and provider to local storage
  useEffect(() => {
    if (!connectedAccount) return;
    const { account } = savedAccount;
    if (account !== connectedAccount.address) {
      console.log('connectedAccount', connectedAccount);
      setSavedAccount({
        provider: connectedAccount.providerName,
        account: connectedAccount.address,
      });
    }
  }, [connectedAccount, savedAccount, setSavedAccount]);

  // Sync account and provider from local storage
  useEffect(() => {
    if (wallets.length === 0) return;
    const { account, provider } = savedAccount;
    if (!account || !provider) return;

    const savedProvider = wallets.find((p) => p.name() === provider);

    if (!savedProvider) return;

    savedProvider.accounts().then((accounts) => {
      const acc = accounts.find((a) => a.address === account);
      if (acc?.address !== connectedAccount?.address) {
        setConnectedAccount(acc);
      }

      if (currentWallet?.name() !== savedProvider.name()) {
        setCurrentWallet(savedProvider);
      }
    });
  }, [
    wallets,
    savedAccount,
    connectedAccount,
    currentWallet,
    setConnectedAccount,
    setCurrentWallet,
  ]);
};

export default useAccountSync;
