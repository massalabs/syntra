import {
  Account,
  Args,
  JsonRPCClient,
  SmartContract,
  Web3Provider,
} from '@massalabs/massa-web3';
import { getScByteCode } from './utils';

import * as dotenv from 'dotenv';
dotenv.config();

export async function deploy(file: string, args: Args, coins: bigint) {
  const client = JsonRPCClient.buildnet();
  const account = await Account.fromEnv();

  console.log('Deploying contract...');

  const contract = await SmartContract.deploy(
    new Web3Provider(client, account),
    getScByteCode('build', file),
    args.serialize(),
    {
      coins: coins,
    },
  );

  const contractAddress = contract.address.toString();

  console.log('Contract deployed at: ', contractAddress);

  const events = await client.getEvents({
    smartContractAddress: contractAddress,
    isFinal: true,
  });

  return { contractAddress, events, contract };
}
