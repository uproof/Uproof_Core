import {config as loadEnv} from 'dotenv';
import {spawnSync} from 'child_process';
import path from 'path';

const command = process.argv[2] || 'dev';
const nextBinary = path.join(process.cwd(), 'node_modules', '.bin', process.platform === 'win32' ? 'next.cmd' : 'next');

loadEnv({path: '.env.crm.local'});

const commandArgs = {
  dev: ['dev'],
  build: ['build'],
  start: ['start'],
}[command];

if (!commandArgs) {
  console.error(`Unknown Next command: ${command}`);
  process.exit(1);
}

const result = spawnSync(nextBinary, commandArgs, {
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);
