import {
  Account,
  Args,
  JsonRPCClient,
  Mas,
  SmartContract,
} from '@massalabs/massa-web3';
import { getScByteCode } from './utils';

export async function deploy() {
  const client = JsonRPCClient.buildnet();
  const account = await Account.fromEnv();

  console.log('Deploying contract...');

  const contract = await SmartContract.deploy(client, account, {
    byteCode: getScByteCode('build', 'main.wasm'),
    parameter: new Args().serialize(),
    coins: Mas.fromString('1'),
  });

  const smartContractAddress = contract.address.toString();

  console.log('Contract deployed at: ', smartContractAddress);

  const events = await client.getEvents({
    smartContractAddress,
    isFinal: true,
  });

  for (const event of events) {
    console.log('Event: ', event.data);
  }

  return smartContractAddress;
}

deploy();
