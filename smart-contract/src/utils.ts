import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { Account, SmartContract, Web3Provider } from '@massalabs/massa-web3';

import * as dotenv from 'dotenv';
import { SCOutputEvent } from '@massalabs/massa-web3/dist/esm/generated/client'; // TODO - Export it
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

export async function getClientAndContract(contractAddress: string) {
  const provider = Web3Provider.buildnet(await Account.fromEnv());
  const account = await Account.fromEnv();
  return {
    provider,
    account,
    contract: new SmartContract(provider, contractAddress),
  };
}

export function periodsToMilliseconds(
  periods: number,
  periodDuration = 20000,
): number {
  return periods * periodDuration;
}

export function separator() {
  console.log('\n' + '-'.repeat(20) + '\n');
}

export function logEvents(events: SCOutputEvent[]) {
  events.forEach((event) =>
    console.log(
      `Event${event.context.is_error ? ' (error)' : ''}:  ${event.data}`,
    ),
  );
}
