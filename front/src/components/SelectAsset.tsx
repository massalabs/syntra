import { useState } from 'react';
import { supportedTokens, MasToken } from '../const/assets';
import { Asset } from '@massalabs/react-ui-kit/src/lib/token/models/AssetModel';
import { AssetSelector } from '@massalabs/react-ui-kit/src/lib/token/AssetSelector';
import useSchedule from '../services/useSchedule';
import { InputLabel } from './InputLabel';

export default function SelectAsset({
  isVesting,
}: {
  isVesting: boolean;
}): JSX.Element {
  const tokens = isVesting ? [MasToken] : supportedTokens;
  const [selectedAsset, setSelectedAsset] = useState<Asset>(tokens[0]);
  const { setScheduleInfo } = useSchedule();

  function onAssetChange(asset: Asset) {
    setSelectedAsset(asset);
    setScheduleInfo('asset', asset);
  }

  return (
    <>
      <InputLabel label="Token" />
      <AssetSelector
        selectedAsset={selectedAsset}
        onAssetChange={onAssetChange}
        assets={tokens}
        isAssetsLoading={false}
      />
    </>
  );
}
