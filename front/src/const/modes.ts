export enum BridgeMode {
  mainnet = 'mainnet',
  testnet = 'testnet',
}

export const config = {
  [BridgeMode.mainnet]: {
    massaSchedulerContract:
      'AS12Kkm5NXHb4xjJJRBDSJiSUsSSbV7DcBCLSS1Zdugz1WdzjVSxg',
    wmas_address: '0xDc074966De429c92614769Dc6546A8E72E83175D' as `0x${string}`,
  },
  [BridgeMode.testnet]: {
    massaSchedulerContract:
      'AS1owaJB7NkqY2pjsggBP7m1jFA9XRZKGpXBbjBMeysQDSxjm7MS',

    wmas_address: '0x3C53552D3A54672fe1113e2FDDd2099d6E9E585D' as `0x${string}`,
  },
};

export const AVAILABLE_MODES = [BridgeMode.mainnet, BridgeMode.testnet];

export enum Blockchain {
  MASSA = 'Massa',
  MASSA_BUILDNET = 'Buildnet',
  MASSA_MAINNET = 'Mainnet',
}
