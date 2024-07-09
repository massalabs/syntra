import { Args, Serializable, Result } from '@massalabs/as-types';
import { u256 } from 'as-bignum/assembly';

export class Schedule implements Serializable {
  constructor(
    public id: u64 = 0,
    public tokenAddress: string = '',
    public spender: string = '',
    public recipient: string = '',
    public amount: u256 = u256.Zero,
    public interval: u64 = 0,
    public times: u64 = 0,
    public tolerance: u64 = 0,
  ) {}

  serialize(): StaticArray<u8> {
    return new Args()
      .add(this.id)
      .add(this.tokenAddress)
      .add(this.spender)
      .add(this.recipient)
      .add(this.amount)
      .add(this.interval)
      .add(this.times)
      .add(this.tolerance)
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
    const resultTimes = args.nextU64();
    if (resultTimes.isErr()) {
      return new Result(0, "Can't deserialize times.");
    }
    const resultTolerance = args.nextU64();
    if (resultTolerance.isErr()) {
      return new Result(0, "Can't deserialize tolerance.");
    }

    const resultStartTimestamp = args.nextU64();

    if (resultStartTimestamp.isErr()) {
      return new Result(0, "Can't deserialize startTimestamp.");
    }

    this.id = resultId.unwrap();
    this.tokenAddress = resultTokenAddress.unwrap();
    this.spender = resultSpender.unwrap();
    this.recipient = resultRecipient.unwrap();
    this.amount = resultAmount.unwrap();
    this.interval = resultInterval.unwrap();
    this.times = resultTimes.unwrap();
    this.tolerance = resultTolerance.unwrap();

    return new Result(args.offset);
  }
}
