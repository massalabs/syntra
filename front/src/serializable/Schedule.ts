import { ScheduleInfo } from '@/services/useCreateSchedule';
import {
  Args,
  ISerializable,
  IDeserializedResult,
} from '@massalabs/massa-web3';

export class Schedule implements ISerializable<Schedule> {
  /**
   * Creates a new Schedule instance.
   *
   * @param id - The unique identifier for the schedule. Default is 0n.
   * @param tokenAddress - The address of the token to be transferred. Default is an empty string.
   * @param spender - The address of the spender. Default is an empty string.
   * @param recipient - The address of the recipient. Default is an empty string.
   * @param amount - The amount of tokens to be transferred. Default is 1n.
   * @param interval - The interval between transfers in some unit of time. Default is 1n.
   * @param occurrences - The number of occurrences for the transfer. Default is 1n.
   * @param remaining - The number of remaining transfers. Default is 1n.
   * @param tolerance - The tolerance for the transfer timing. Default is 1n.
   * @param history - The history of transfers. Default is an empty array.
   */
  constructor(
    public id: bigint = 0n,
    public tokenAddress: string = '',
    public spender: string = '',
    public recipient: string = '',
    public amount: bigint = 1n,
    public interval: bigint = 1n,
    public occurrences: bigint = 1n,
    public remaining: bigint = 1n,
    public tolerance: bigint = 1n,
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
      0n,
      info.asset.address,
      info.spender,
      info.recipient,
      info.amount,
      info.interval,
      info.occurrences,
      info.occurrences,
      info.tolerance,
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
