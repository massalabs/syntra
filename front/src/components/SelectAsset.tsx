import { useEffect, useState, useMemo } from 'react';
import { Asset } from '@massalabs/react-ui-kit/src/lib/token/models/AssetModel';
import { AssetSelector } from '@massalabs/react-ui-kit/src/lib/token/AssetSelector';
import { InputLabel } from './InputLabel';
import { useTokenStore } from '@/store/token';
import { useSchedulerStore } from '@/store/scheduler';

export default function SelectAsset({
  isVesting,
  disabled,
}: {
  isVesting: boolean;
  disabled: boolean;
}): JSX.Element {
  const { tokens: supportedTokens, mas } = useTokenStore.getState();
  const tokens = useMemo(
    () => (isVesting ? [mas] : supportedTokens),
    [isVesting, mas, supportedTokens],
  );
  const [selectedAsset, setSelectedAsset] = useState<Asset>(tokens[0]);
  const { setScheduleInfo } = useSchedulerStore();

  useEffect(() => {
    if (tokens.length === 0) return;
    setScheduleInfo('asset', tokens[0]);
  }, [setScheduleInfo, tokens]);

  function onAssetChange(asset: Asset) {
    setSelectedAsset(asset);
    setScheduleInfo('asset', asset);
  }

  return (
    <div
      className={
        disabled
          ? 'filter grayscale opacity-50 cursor-not-allowed pointer-events-none'
          : ''
      }
    >
      <InputLabel label="Token" />
      <AssetSelector
        selectedAsset={selectedAsset}
        onAssetChange={onAssetChange}
        assets={tokens}
        isAssetsLoading={false}
      />
    </div>
  );
}
