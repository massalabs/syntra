import {
  Args,
  IDeserializedResult,
  ISerializable,
} from '@massalabs/massa-web3';

export class TokenPair implements ISerializable<TokenPair> {
  constructor(
    public massaToken: string = '',
    public evmToken: string = '',
    public chainId: number = 0,
  ) {}

  serialize(): Uint8Array {
    const args = new Args();
    args.addString(this.massaToken);
    args.addString(this.evmToken);
    args.addU64(BigInt(this.chainId));
    return new Uint8Array(args.serialize());
  }

  deserialize(
    data: Uint8Array,
    offset: number,
  ): IDeserializedResult<TokenPair> {
    const args = new Args(data, offset);
    this.massaToken = args.nextString();
    this.evmToken = args.nextString();
    this.chainId = parseInt(args.nextU64().toString());

    return { instance: this, offset: args.getOffset() };
  }
}
