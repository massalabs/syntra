import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import {
  Account,
  Address,
  JsonRPCClient,
  SmartContract,
} from '@massalabs/massa-web3';

import * as dotenv from 'dotenv';
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
  const client = JsonRPCClient.buildnet();
  const account = await Account.fromEnv();
  return {
    client,
    account,
    contract: SmartContract.fromAddress(
      client,
      Address.fromString(contractAddress),
      account,
    ),
  };
}

export function periodsToSeconds(
  periods: number,
  periodDuration = 20000,
): number {
  return periods * periodDuration;
}

export function separator() {
  console.log('\n' + '-'.repeat(20) + '\n');
}
