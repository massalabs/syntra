import { u256 } from 'as-bignum/assembly';
import { Schedule } from '../Schedule';
import { HISTORY_ITEM_STORAGE_COST } from '../refund';
import { getBalanceEntryCost } from '@massalabs/sc-standards/assembly/contracts/FT/token-external';
import {
  Address,
  changeCallStack,
  mockBalance,
  mockScCall,
  mockTransferredCoins,
  Storage,
} from '@massalabs/massa-as-sdk';
import { Args, u256ToBytes } from '@massalabs/as-types';
import { startScheduleSend } from '../contracts/main';
import { balanceKey } from '@massalabs/sc-standards/assembly/contracts/FT/token-internals';

export const contractAddress =
  'AS12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT';
export const admin = 'AU1mhPhXCfh8afoNnbW91bXUVAmu8wU7u8v54yNTMvY7E52KBbz3';
export const tokenAddress =
  'AS12LpYyAjYRJfYhyu7fkrS224gMdvFHVEeVWoeHZzMdhis7UZ3Eb';
export const spender1 = 'AU12NT6c6oiYQhcXNAPRRqDudZGurJkFKcYNLPYSwYkMoEniHv8FW';
export const spender2 = 'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq';
export const recipient =
  'AU12W92UyGW4Bd94BPniTq4Ra5yhiv6RvjazV2G9Q9GyekYkgqbme';
export const amount = u256.fromU64(12345678910);
export const interval: u64 = 60;
export const occurrences: u64 = 10;
export const tolerance: u32 = 5;

export function switchUser(user: string): void {
  changeCallStack(user + ' , ' + contractAddress);
}

export function createSchedule(spender: string = spender1): void {
  // mock allowance
  // @ts-ignore
  mockScCall(u256ToBytes(amount * u256.fromU64(occurrences)));

  // mock transferFrom
  mockScCall([]);

  const schedule = new Schedule(
    0,
    'lolmao',
    false,
    tokenAddress,
    spender,
    recipient,
    amount,
    interval,
    occurrences,
    occurrences,
    tolerance,
  );

  const updateCost = HISTORY_ITEM_STORAGE_COST * occurrences;
  const sendCost = getBalanceEntryCost(tokenAddress, recipient);
  const total = updateCost + sendCost;

  mockBalance(spender, total);
  mockTransferredCoins(total);
  const params = new Args().add(schedule);

  startScheduleSend(params.serialize());

  // Set the balance entry on token contract
  // with this set, the cost of creating token balance entry will be 0
  Storage.setOf(
    new Address(tokenAddress),
    balanceKey(new Address(recipient)),
    u256ToBytes(schedule.amount),
  );
}

export function createMasSchedule(spender: string = spender1): void {
  const schedule = new Schedule(
    0,
    'lolmao',
    true,
    '',
    spender,
    recipient,
    amount,
    interval,
    occurrences,
    occurrences,
    tolerance,
  );

  const params = new Args().add(schedule);

  const updateCost = HISTORY_ITEM_STORAGE_COST * occurrences;
  const sendCost = schedule.amount.toU64() * schedule.occurrences;
  const total = updateCost + sendCost;

  mockBalance(spender, total);
  mockTransferredCoins(total);

  startScheduleSend(params.serialize());
}
