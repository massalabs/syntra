import { useEffect, useState } from 'react';
import { Asset } from '@massalabs/react-ui-kit/src/lib/token/models/AssetModel';
import { AssetSelector } from '@massalabs/react-ui-kit/src/lib/token/AssetSelector';

import { useTokenStore } from '@/store/store';
import { useAccountStore } from '@massalabs/react-ui-kit';

export default function SelectAsset({
  onSelectAsset,
}: {
  onSelectAsset: (asset: Asset) => void;
}): JSX.Element {
  const [selectedAsset, setSelectedAsset] = useState<Asset>();
  const { connectedAccount } = useAccountStore();
  const { tokens, getTokens } = useTokenStore();

  useEffect(() => {
    if (!connectedAccount) return;
    getTokens();
  }, [connectedAccount, getTokens]);

  console.log('tokens', tokens);

  function onAssetChange(asset: Asset) {
    setSelectedAsset(asset);
    onSelectAsset(asset);
  }

  return (
    <></>
    // <AssetSelector
    //   // selectedAsset={selectedAsset}
    //   onAssetChange={onAssetChange}
    //   assets={tokens}
    //   isAssetsLoading={false}
    // />
  );
}
