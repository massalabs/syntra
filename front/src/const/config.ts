export enum Mode {
  mainnet = 'Mainnet',
  buildnet = 'Buildnet',
}

export const config = {
  [Mode.mainnet]: {
    SchedulerContract: 'AS1M8wRz3nyjGdHPeZ7oodyrek5aT8BXaqZEBqANTtcaFEESt2rE',
  },
  [Mode.buildnet]: {
    SchedulerContract: 'AS1M8wRz3nyjGdHPeZ7oodyrek5aT8BXaqZEBqANTtcaFEESt2rE',
  },
};
