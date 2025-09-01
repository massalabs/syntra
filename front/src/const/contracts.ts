import { NetworkName } from '@massalabs/massa-web3';

export const CONTRACT_VERSIONS = {
  [NetworkName.Buildnet]: [
    {
      address: 'AS1FmYN5nqeUzNycSZFBYdcno4tFCgNfPfMwhPCxCZLgFJy4YMUp', // Old contract
      active: false,
    },
    {
      address: 'AS1aZX1vFSDcHDCiPKLBYdaxF8kTT4XdU375yScqZNNVKa69ofyi',
      active: true,
    },
  ],
  [NetworkName.Mainnet]: [
    {
      address: 'AS1WHog6myEJg1qydeopye6VSaC4yKKhZEjPhEGAgWYMPNLsKfLf', // Old contract
      active: false,
    },
    {
      address: 'AS1gsVowdonH3iuYYJVGVSdStUd3J9WyA9Mk6QUJQCUHykHdFDK3',
      active: true,
    },
  ],
} as const;

// Network-aware helper functions
export const getActiveContract = (network: NetworkName): string => {
  const networkContracts =
    CONTRACT_VERSIONS[network as keyof typeof CONTRACT_VERSIONS];
  const activeContract = networkContracts.find((contract) => contract.active);
  if (!activeContract) {
    throw new Error(`No active contract found for network ${network}`);
  }
  return activeContract.address;
};

export const getAllContractAddresses = (network: NetworkName) => {
  const networkContracts =
    CONTRACT_VERSIONS[network as keyof typeof CONTRACT_VERSIONS];
  return networkContracts.map((contract) => contract.address);
};
