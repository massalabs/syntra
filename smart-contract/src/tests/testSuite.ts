import { run } from './e2e';
import { separator } from '../utils';

console.log('Running e2e tests for FT token');
await run(false);
separator();
console.log('Running e2e tests for MAS token');
await run(true);
separator();
console.log('All good! 🎉');
