import {
  balance,
  Context,
  generateEvent,
  transferCoins,
  transferredCoins,
} from '@massalabs/massa-as-sdk';
import { Schedule } from './Schedule';
import { getBalanceEntryCost } from '@massalabs/sc-standards/assembly/contracts/FT/token-external';
import { SafeMath } from '@massalabs/as-types';

export const UPDATE_COST = 900_000;

// refundMas sends back the remaining coins to the caller after schedule creation
export function refundMas(schedule: Schedule, initBal: u64): void {
  const createCost = initBal - balance();
  const updatesCost = UPDATE_COST * schedule.occurrences;
  let sendCost: u64 = 0;
  if (schedule.tokenAddress.length) {
    sendCost = getBalanceEntryCost(schedule.tokenAddress, schedule.recipient);
  } else {
    const totalAmount = SafeMath.mul(
      schedule.amount.toU64(),
      schedule.occurrences,
    );
    sendCost = totalAmount;
  }
  const totalCost = createCost + updatesCost + sendCost;

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
