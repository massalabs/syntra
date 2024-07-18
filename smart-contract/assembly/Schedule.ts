import { Args, Serializable, Result } from '@massalabs/as-types';
import { createEvent } from '@massalabs/massa-as-sdk';
import { u256 } from 'as-bignum/assembly';

export class Schedule implements Serializable {
  constructor(
    public id: u64 = 0,
    public tokenAddress: string = '',
    public spender: string = '',
    public recipient: string = '',
    public amount: u256 = u256.Zero,
    public interval: u64 = 0,
    public occurrences: u64 = 0,
    public remaining: u64 = 0,
    public tolerance: u32 = 0,
    public history: Transfer[] = [],
  ) {}

  serialize(): StaticArray<u8> {
    return new Args()
      .add(this.id)
      .add(this.tokenAddress)
      .add(this.spender)
      .add(this.recipient)
      .add(this.amount)
      .add(this.interval)
      .add(this.occurrences)
      .add(this.remaining)
      .add(this.tolerance)
      .addSerializableObjectArray(this.history)
      .serialize();
  }

  deserialize(data: StaticArray<u8>, offset: i32): Result<i32> {
    const args = new Args(data, offset);
    const resultId = args.nextU64();
    if (resultId.isErr()) {
      return new Result(0, "Can't deserialize id.");
    }
    const resultTokenAddress = args.nextString();
    if (resultTokenAddress.isErr()) {
      return new Result(0, "Can't deserialize tokenAddress.");
    }
    const resultSpender = args.nextString();
    if (resultSpender.isErr()) {
      return new Result(0, "Can't deserialize spender.");
    }
    const resultRecipient = args.nextString();
    if (resultRecipient.isErr()) {
      return new Result(0, "Can't deserialize recipient.");
    }
    const resultAmount = args.nextU256();
    if (resultAmount.isErr()) {
      return new Result(0, "Can't deserialize amount.");
    }
    const resultInterval = args.nextU64();
    if (resultInterval.isErr()) {
      return new Result(0, "Can't deserialize interval.");
    }
    const resultOccurrences = args.nextU64();
    if (resultOccurrences.isErr()) {
      return new Result(0, "Can't deserialize occurrences.");
    }
    const resultRemaining = args.nextU64();
    if (resultRemaining.isErr()) {
      return new Result(0, "Can't deserialize times.");
    }
    const resultTolerance = args.nextU32();
    if (resultTolerance.isErr()) {
      return new Result(0, "Can't deserialize tolerance.");
    }
    const resultHistory = args.nextSerializableObjectArray<Transfer>();
    if (resultHistory.isErr()) {
      return new Result(0, "Can't deserialize history.");
    }

    this.id = resultId.unwrap();
    this.tokenAddress = resultTokenAddress.unwrap();
    this.spender = resultSpender.unwrap();
    this.recipient = resultRecipient.unwrap();
    this.amount = resultAmount.unwrap();
    this.interval = resultInterval.unwrap();
    this.occurrences = resultOccurrences.unwrap();
    this.remaining = resultRemaining.unwrap();
    this.tolerance = resultTolerance.unwrap();
    this.history = resultHistory.unwrap();

    return new Result(args.offset);
  }

  public createTransferEvent(period: u64, thread: u8): string {
    return createEvent('Transfer', [
      this.id.toString(),
      this.remaining.toString(),
      period.toString(),
      thread.toString(),
    ]);
  }
}

export class Transfer implements Serializable {
  constructor(public period: u64 = 0, public thread: u8 = 0) {}

  serialize(): StaticArray<u8> {
    return new Args().add(this.period).add(this.thread).serialize();
  }

  deserialize(data: StaticArray<u8>, offset: i32): Result<i32> {
    const args = new Args(data, offset);
    const resultPeriod = args.nextU64();
    if (resultPeriod.isErr()) {
      return new Result(0, "Can't deserialize period.");
    }
    const resultThread = args.nextU8();
    if (resultThread.isErr()) {
      return new Result(0, "Can't deserialize thread.");
    }

    this.period = resultPeriod.unwrap();
    this.thread = resultThread.unwrap();

    return new Result(args.offset);
  }
}
