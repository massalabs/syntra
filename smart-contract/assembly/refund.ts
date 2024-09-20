import {
  balance,
  Context,
  generateEvent,
  transferCoins,
  transferredCoins,
} from '@massalabs/massa-as-sdk';
import { Schedule } from './Schedule';
import { SafeMath } from '@massalabs/as-types';

export const HISTORY_ITEM_STORAGE_COST = 1_700_000;

// refundMas sends back the remaining coins to the caller after schedule creation
export function refundMas(schedule: Schedule, initBal: u64): void {
  const createCost = initBal - balance();
  // first history update is made at schedule creation (included in createCost)
  const updatesCost = HISTORY_ITEM_STORAGE_COST * (schedule.occurrences - 1);
  let masToSend: u64 = 0;

  // native token schedule
  if (!schedule.tokenAddress.length) {
    // first MAS send is made at schedule creation (included in createCost)
    masToSend = SafeMath.mul(schedule.amount.toU64(), schedule.occurrences - 1);
  }
  const totalCost = createCost + updatesCost + masToSend;

  const coins = transferredCoins();

  assert(
    coins >= totalCost,
    'Not enough Mas included to pay all scheduled operations',
  );
  // send back the remaining coins
  const refundAmount = coins - totalCost;
  transferCoins(Context.caller(), refundAmount);

  generateEvent('refunded Mas: ' + refundAmount.toString());
}
