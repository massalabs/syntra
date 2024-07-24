import { _mint } from '@massalabs/sc-standards/assembly/contracts/FT/mintable/mint-internal';

export * from '@massalabs/sc-standards/assembly/contracts/FT/token';
export * from '@massalabs/sc-standards/assembly/contracts/FT/burnable';
export * from '@massalabs/sc-standards/assembly/contracts/utils/accessControl';
export * from '@massalabs/sc-standards/assembly/contracts/utils/ownership';

export function mint(binaryArgs: StaticArray<u8>): void {
  _mint(binaryArgs);
}
