import { useEffect } from 'react';
import { useAccountStore } from '@massalabs/react-ui-kit';
// TODO - Export in ui-kit
import { useLocalStorage } from '@massalabs/react-ui-kit/src/lib/util/hooks/useLocalStorage';

type SavedAccount = {
  provider: string;
  account: string;
};

const useAccountSync = () => {
  const {
    providers,
    currentProvider,
    connectedAccount,
    setCurrentProvider,
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
    const { account, provider } = savedAccount;
    if (account !== connectedAccount.address()) {
      console.log('connectedAccount', connectedAccount);
      setSavedAccount({
        provider: connectedAccount.providerName(),
        account: connectedAccount.address(),
      });
    }
  }, [connectedAccount]);

  // Sync account and provider from local storage
  useEffect(() => {
    if (providers.length === 0) return;
    const { account, provider } = savedAccount;
    if (!account || !provider) return;

    const savedProvider = providers.find((p) => p.name() === provider);

    if (!savedProvider) return;

    savedProvider.accounts().then((accounts) => {
      const acc = accounts.find((a) => a.address() === account);
      if (acc?.address() !== connectedAccount?.address()) {
        setConnectedAccount(acc);
      }

      if (currentProvider?.name() !== savedProvider.name()) {
        setCurrentProvider(savedProvider);
      }
    });
  }, [providers]);
};

export default useAccountSync;
