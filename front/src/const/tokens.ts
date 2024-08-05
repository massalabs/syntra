import { IToken } from '@/store/tokenStore';
import { fakeTokenAddress } from './contracts';

export const tokenList: IToken[] = [
  {
    name: 'Dummy asset',
    address: fakeTokenAddress,
    symbol: 'DAS',
    decimals: 18n,
    balance: 0n,
    allowance: 0n,
    chainId: 0,
  },
  // {
  //   name: 'PUR token',
  //   address: 'ASBLBLABLA...BLA',
  //   symbol: 'PUR',
  //   decimals: 18,
  //   balance: undefined,
  //   isDefault: true,
  //   dollarValue: undefined,
  //   originChainId: 0,
  // },
  // {
  //   name: 'PUR token',
  //   address: 'ASBLBLABLA...BLA',
  //   symbol: 'WETH',
  //   decimals: 18,
  //   balance: '1001000000000000000000',
  //   isDefault: true,
  //   dollarValue: undefined,
  //   originChainId: 0,
  // },
];
