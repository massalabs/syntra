import { Args, Mas } from '@massalabs/massa-web3';
import { deploy } from './lib-deploy';
import { getClientAndContract } from './utils';

const { provider } = await getClientAndContract();
deploy(provider, 'main.wasm', new Args(), Mas.fromString('1'));
