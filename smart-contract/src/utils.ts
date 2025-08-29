import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import {
  Account,
  SmartContract,
  Web3Provider,
  rpcTypes as t,
} from '@massalabs/massa-web3';
import * as dotenv from 'dotenv';
import { CONTRACT_ADDRESS, isMainnet } from './config';

dotenv.config();

export function getEnvVariable(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing ${key} in .env file`);
  }
  return value;
}

export function getScByteCode(folderName: string, fileName: string): Buffer {
  // Obtain the current file name and directory paths
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(path.dirname(__filename));
  return readFileSync(path.join(__dirname, folderName, fileName));
}

export async function getClientAndContract() {
  const account = await Account.fromEnv();
  const provider = isMainnet
    ? Web3Provider.mainnet(account)
    : Web3Provider.buildnet(account);
  return {
    provider,
    account,
    contract: new SmartContract(provider, CONTRACT_ADDRESS),
  };
}

export function periodsToMilliseconds(
  periods: number,
  periodDuration = 16000,
): number {
  return periods * periodDuration;
}

export function separator() {
  console.log('\n' + '-'.repeat(20) + '\n');
}

export function logEvents(events: t.OutputEvents) {
  events.forEach((event) =>
    console.log(
      `Event${event.context.is_error ? ' (error)' : ''}:  ${event.data}`,
    ),
  );
}
