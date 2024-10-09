import { Asset } from '@massalabs/react-ui-kit/src/lib/token/models/AssetModel';

// buildnet
export const supportedTokens: Asset[] = [
  {
    name: 'tDAI.s',
    address: 'AS12LpYyAjYRJfYhyu7fkrS224gMdvFHVEeVWoeHZzMdhis7UZ3Eb',
    symbol: 'tDAI.s',
    decimals: 18,
    balance: 0n,
    allowance: 0n,
    chainId: 0,
  },
  {
    name: 'Wrapped MASSA',
    address: 'AS12FW5Rs5YN2zdpEnqwj4iHUUPt9R4Eqjq2qtpJFNKW3mn33RuLU',
    symbol: 'WMAS',
    decimals: 9,
    balance: 0n,
    allowance: 0n,
    chainId: 0,
  },
];

// mainnet
// export const supportedTokens: Asset[] = [
//   {
//     name: 'DAI.e',
//     address: 'AS1ZGF1upwp9kPRvDKLxFAKRebgg7b3RWDnhgV7VvdZkZsUL7Nuv',
//     symbol: 'DAI.e',
//     decimals: 18,
//     balance: 0n,
//     allowance: 0n,
//     chainId: 0,
//   },
//   {
//     name: 'Wrapped MASSA',
//     address: 'AS12U4TZfNK7qoLyEERBBRDMu8nm5MKoRzPXDXans4v9wdATZedz9',
//     symbol: 'WMAS',
//     decimals: 9,
//     balance: 0n,
//     allowance: 0n,
//     chainId: 0,
//   },
// ];

export const MasToken = {
  name: 'MAS',
  address: '',
  symbol: 'MAS',
  decimals: 9,
  balance: 0n,
  allowance: 0n,
  chainId: 0,
};
