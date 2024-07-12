import {
  Args,
  ISerializable,
  IDeserializedResult,
} from '@massalabs/massa-web3';

export class Schedule implements ISerializable<Schedule> {
  constructor(
    public id: bigint = 0n,
    public tokenAddress: string = '',
    public spender: string = '',
    public recipient: string = '',
    public amount: bigint = 0n,
    public interval: bigint = 0n,
    public times: bigint = 0n,
    public tolerance: bigint = 0n,
  ) {}

  serialize(): Uint8Array {
    const args = new Args();
    args.addU64(this.id);
    args.addString(this.tokenAddress);
    args.addString(this.spender);
    args.addString(this.recipient);
    args.addU256(this.amount);
    args.addU64(this.interval);
    args.addU64(this.times);
    args.addU64(this.tolerance);
    return new Uint8Array(args.serialize());
  }

  deserialize(data: Uint8Array, offset: number): IDeserializedResult<Schedule> {
    const args = new Args(data, offset);

    this.id = args.nextU64();
    this.tokenAddress = args.nextString();
    this.spender = args.nextString();
    this.recipient = args.nextString();
    this.amount = args.nextU256();
    this.interval = args.nextU64();
    this.times = args.nextU64();
    this.tolerance = args.nextU64();

    return { instance: this, offset: args.getOffset() };
  }
}
