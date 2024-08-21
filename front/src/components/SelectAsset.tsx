import { useState } from 'react';
import { supportedTokens } from '../const/assets';
import { Asset } from '@massalabs/react-ui-kit/src/lib/token/models/AssetModel';
import { AssetSelector } from '@massalabs/react-ui-kit/src/lib/token/AssetSelector';

export default function SelectAsset({
  onSelectAsset,
}: {
  onSelectAsset: (asset: Asset) => void;
}): JSX.Element {
  const [selectedAsset, setSelectedAsset] = useState<Asset>(supportedTokens[0]);

  function onAssetChange(asset: Asset) {
    setSelectedAsset(asset);
    onSelectAsset(asset);
  }

  return (
    <AssetSelector
      selectedAsset={selectedAsset}
      onAssetChange={onAssetChange}
      assets={supportedTokens}
      isAssetsLoading={false}
    />
  );
}
