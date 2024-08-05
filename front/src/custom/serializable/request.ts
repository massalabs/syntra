import {
  Args,
  IDeserializedResult,
  ISerializable,
} from '@massalabs/massa-web3';

import { TokenPair } from './tokenPair';

export class ForwardingRequest implements ISerializable<ForwardingRequest> {
  opId = '';
  caller = '';
  logIdx = 0;
  public amount = '0';

  constructor(
    amount: string | bigint,
    public receiver: string = '',
    public tokenPair: TokenPair = new TokenPair('', '', 0),
    public signatures: Uint8Array = new Uint8Array(),
  ) {
    this.amount = amount.toString();
  }

  serialize(): Uint8Array {
    const args = new Args();
    args.addU256(BigInt(this.amount));
    args.addString(this.caller);
    args.addString(this.receiver);
    args.addString(this.opId);
    args.addU32(this.logIdx);
    args.addSerializable(this.tokenPair);
    args.addUint8Array(this.signatures);
    return new Uint8Array(args.serialize());
  }

  deserialize(
    data: Uint8Array,
    offset: number,
  ): IDeserializedResult<ForwardingRequest> {
    const args = new Args(data, offset);
    this.amount = args.nextU256().toString();
    this.caller = args.nextString();
    this.receiver = args.nextString();
    this.opId = args.nextString();
    this.logIdx = args.nextU32();
    this.tokenPair = args.nextSerializable(TokenPair);
    this.signatures = args.nextUint8Array();
    return { instance: this, offset: args.getOffset() };
  }
}
