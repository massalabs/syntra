import { MasToken, supportedTokens } from '@/const/assets';

export function getTokenInfo(tokenAddress: string | null) {
  if (!tokenAddress) return MasToken;

  const token = supportedTokens.find((t) => t.address === tokenAddress);

  if (!token) {
    return {
      name: 'Unknown',
      address: tokenAddress,
      symbol: 'Unknown',
      decimals: 18,
      balance: 0n,
      allowance: 0n,
      chainId: 0,
    };
  }

  return token;
}
