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
    <div className="flex justify-left items-center gap-4">
      <InputLabel label="Mode:" />
      <div className="flex items-center gap-10 mb-2 mx-4">
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
