import { InputLabel } from './InputLabel';
import ModeRadioButton from './ModeRadioButton';

export function SelectMode({
  isVesting,
  handleModeChange,
  tipsModeDesc,
  vestingModeDesc,
  disabled,
}: {
  isVesting: boolean;
  handleModeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tipsModeDesc: string;
  vestingModeDesc: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      <InputLabel label="Select Mode" />
      <div className="flex items-center gap-4">
        <ModeRadioButton
          disabled={disabled}
          isVesting={!isVesting}
          handleModeChange={handleModeChange}
          mode="tips"
          modeDesc={tipsModeDesc}
        />
        <ModeRadioButton
          disabled={disabled}
          isVesting={isVesting}
          handleModeChange={handleModeChange}
          mode="vesting"
          modeDesc={vestingModeDesc}
        />
      </div>
    </div>
  );
}
