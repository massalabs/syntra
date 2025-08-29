import { Args, Provider, SmartContract } from '@massalabs/massa-web3';
import { getScByteCode } from './utils';

export async function deploy(
  provider: Provider,
  file: string,
  args: Args,
  coins: bigint,
) {
  console.log('Deploying contract...');

  const contract = await SmartContract.deploy(
    provider,
    getScByteCode('build', file),
    args.serialize(),
    {
      coins,
    },
  );

  const contractAddress = contract.address.toString();

  console.log('Contract deployed at: ', contractAddress);

  const events = await provider.getEvents({
    smartContractAddress: contractAddress,
    isFinal: true,
  });

  return { contractAddress, events, contract };
}
