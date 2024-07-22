import {
  Args,
  ISerializable,
  IDeserializedResult,
} from '@massalabs/massa-web3';

type ScheduleInfo = {
  id?: bigint;
  amount: bigint;
  interval: bigint;
  recipient: string;
  spender: string;
  tokenAddress: string;
  occurrences: bigint;
  remaining: bigint;
  tolerance: bigint;
  history?: Transfer[];
};

export class Schedule implements ISerializable<Schedule> {
  constructor(
    public id: bigint = 0n,
    public tokenAddress: string = '',
    public spender: string = '',
    public recipient: string = '',
    public amount: bigint = 0n,
    public interval: bigint = 0n,
    public occurrences: bigint = 0n,
    public remaining: bigint = 0n,
    public tolerance: bigint = 0n,
    public history: Transfer[] = [],
  ) {}

  serialize(): Uint8Array {
    const args = new Args()
      .addU64(this.id)
      .addString(this.tokenAddress)
      .addString(this.spender)
      .addString(this.recipient)
      .addU256(this.amount)
      .addU64(this.interval)
      .addU64(this.occurrences)
      .addU64(this.remaining)
      .addU32(this.tolerance)
      .addSerializableObjectArray(this.history);
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
    this.occurrences = args.nextU64();
    this.remaining = args.nextU64();
    this.tolerance = args.nextU32();
    this.history = args.nextSerializableObjectArray(Transfer);

    return { instance: this, offset: args.getOffset() };
  }

  static fromScheduleInfo(info: ScheduleInfo): Schedule {
    return new Schedule(
      info.id,
      info.tokenAddress,
      info.spender,
      info.recipient,
      info.amount,
      info.interval,
      info.occurrences,
      info.remaining,
      info.tolerance,
      info.history,
    );
  }
}

export class Transfer implements ISerializable<Transfer> {
  constructor(public period: bigint = 0n, public thread: number = 0) {}

  serialize(): Uint8Array {
    const args = new Args().addU64(this.period).addU8(BigInt(this.thread));
    return new Uint8Array(args.serialize());
  }

  deserialize(data: Uint8Array, offset: number): IDeserializedResult<Transfer> {
    const args = new Args(data, offset);

    this.period = args.nextU64();
    this.thread = Number(args.nextU8());

    return { instance: this, offset: args.getOffset() };
  }
}
