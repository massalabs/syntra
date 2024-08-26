import { CHAIN_ID } from '@massalabs/massa-web3';
import { schedulerAddress } from './contracts';

export enum Mode {
  mainnet = Number(CHAIN_ID.Mainnet),
  buildnet = Number(CHAIN_ID.Buildnet),
}

export const config = {
  [CHAIN_ID.Mainnet.toString()]: {
    SchedulerContract: schedulerAddress,
  },
  [CHAIN_ID.Buildnet.toString()]: {
    SchedulerContract: schedulerAddress,
  },
};
