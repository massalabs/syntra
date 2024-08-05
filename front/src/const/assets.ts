import { fakeTokenAddress } from './contracts';

export const assets = [
  {
    name: 'Dummy asset',
    address: fakeTokenAddress,
    symbol: 'DAS',
    decimals: 18,
    balance: undefined,
    isDefault: true,
    dollarValue: undefined,
    originChainId: 0,
  },
  {
    name: 'PUR token',
    address: 'ASBLBLABLA...BLA',
    symbol: 'PUR',
    decimals: 18,
    balance: undefined,
    isDefault: true,
    dollarValue: undefined,
    originChainId: 0,
  },
  {
    name: 'PUR token',
    address: 'ASBLBLABLA...BLA',
    symbol: 'WETH',
    decimals: 18,
    balance: '1001000000000000000000',
    isDefault: true,
    dollarValue: undefined,
    originChainId: 0,
  },
];
