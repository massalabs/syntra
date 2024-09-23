import { ScheduleInfo } from '@/store/scheduler';
import {
  Args,
  ISerializable,
  IDeserializedResult,
} from '@massalabs/massa-web3';

export class Schedule implements ISerializable<Schedule> {
  public id: bigint = 0n;
  public operationId = '';
  public history: Transfer[] = [];
  public remaining: bigint = 0n;

  /**
   * Creates a new Schedule instance.
   *
   * @param id - The unique identifier for the schedule.
   * @param isVesting - The boolean value indicating if the schedule is a vesting schedule.
   * @param tokenAddress - The address of the token to be transferred. Leave empty for MAS schedule.
   * @param spender - The address of the spender.
   * @param recipient - The address of the recipient.
   * @param amount - The amount of tokens to be transferred.
   * @param interval - The interval between transfers in periods.
   * @param occurrences - The number of occurrences for the transfer.
   * @param remaining - The number of remaining transfers.
   * @param tolerance - Validity window in periods.
   * @param history - The history of transfers.
   */
  constructor(
    public isVesting: boolean = false,
    public tokenAddress: string = '',
    public spender: string = '',
    public recipient: string = '',
    public amount: bigint = 1n,
    public interval: bigint = 1n,
    public occurrences: bigint = 1n,
    public tolerance: bigint = 1n,
  ) {}

  serialize(): Uint8Array {
    const args = new Args()
      .addU64(this.id)
      .addString(this.operationId)
      .addBool(this.isVesting)
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
    this.operationId = args.nextString();
    this.isVesting = args.nextBool();
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
      info.isVesting,
      info.asset.address,
      info.spender,
      info.recipient,
      info.amount,
      info.interval,
      info.occurrences,
      info.tolerance,
    );
  }
}

export class Transfer implements ISerializable<Transfer> {
  constructor(
    public period: bigint = 0n,
    public thread: number = 0,
    public taskIndex: bigint = 0n,
  ) {}

  serialize(): Uint8Array {
    const args = new Args()
      .addU64(this.period)
      .addU8(BigInt(this.thread))
      .addU64(this.taskIndex);
    return new Uint8Array(args.serialize());
  }

  deserialize(data: Uint8Array, offset: number): IDeserializedResult<Transfer> {
    const args = new Args(data, offset);

    this.period = args.nextU64();
    this.thread = Number(args.nextU8());
    this.taskIndex = args.nextU64();

    return { instance: this, offset: args.getOffset() };
  }
}
