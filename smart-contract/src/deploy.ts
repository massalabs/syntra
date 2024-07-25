import { Args, Mas } from '@massalabs/massa-web3';
import { deploy } from './lib-deploy';

deploy('main.wasm', new Args(), Mas.fromString('1'));
