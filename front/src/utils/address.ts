import { Address } from '@massalabs/massa-web3';

export const truncateAddress = (
  address?: string,
  startLength = 6,
  endLength = 4,
) => {
  if (!address) return '';
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

export const isValidAddress = (address: string): boolean => {
  try {
    return Address.fromString(address).isEOA;
  } catch (error) {
    return false;
  }
};
