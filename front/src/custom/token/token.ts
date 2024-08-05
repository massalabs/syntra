import { Args, bytesToStr, Provider, U8, U256 } from '@massalabs/massa-web3';

export async function readSC(
  account: Provider,
  targetFunction: string,
  targetAddress: string,
  parameter: Uint8Array,
): Promise<Uint8Array> {
  const res = await account.readSC({
    caller: account.address,
    target: targetFunction,
    func: targetAddress,
    parameter: parameter,
  });

  return res.value;
}

export async function getMassaTokenName(
  targetAddress: string,
  account: Provider,
): Promise<string> {
  return bytesToStr(
    await readSC(account, 'name', targetAddress, new Args().serialize()),
  );
}

export async function getMassaTokenSymbol(
  targetAddress: string,
  account: Provider,
): Promise<string> {
  return bytesToStr(
    await readSC(account, 'symbol', targetAddress, new Args().serialize()),
  );
}

export async function getAllowance(
  spender: string,
  tokenAddress: string,
  account: Provider,
): Promise<bigint> {
  const args = new Args()
    .addString(account.address)
    .addString(spender)
    .serialize();

  const allowance = await readSC(account, 'allowance', tokenAddress, args);

  return U256.fromBytes(allowance);
}

export async function getDecimals(
  targetAddress: string,
  account: Provider,
): Promise<bigint> {
  return U8.fromBytes(
    await readSC(account, 'decimals', targetAddress, new Args().serialize()),
  );
}

export async function getBalance(
  targetAddress: string,
  account: Provider,
): Promise<bigint> {
  const args = new Args().addString(account.address).serialize();
  const data = await readSC(account, 'balanceOf', targetAddress, args);
  return U256.fromBytes(data);
}
