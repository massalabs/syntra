import { MasToken } from '@/const/assets';
import { Asset } from '@massalabs/react-ui-kit/src/lib/token/models/AssetModel';

export function getTokenInfo(tokenAddress: string | null, tokens: Asset[]) {
  if (!tokenAddress) return MasToken;

  const token = tokens.find((t) => t.address === tokenAddress);

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
