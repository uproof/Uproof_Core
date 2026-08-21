import {config as loadEnv} from 'dotenv';
import {spawnSync} from 'child_process';
import {rmSync, existsSync} from 'fs';
import path from 'path';

const command = process.argv[2] || 'dev';
const nextBinary = path.join(process.cwd(), 'node_modules', '.bin', process.platform === 'win32' ? 'next.cmd' : 'next');

const envMode = (process.env.UPROOF_ENV || 'crm').trim().toLowerCase();
const envFiles = envMode === 'cms'
  ? ['.env.cms.local', '.env.crm.local']
  : envMode === 'test'
    ? ['.env.test.local', '.env.crm.local']
    : ['.env.crm.local'];

for (const envFile of envFiles) {
  loadEnv({path: envFile, override: false});
}

if (command === 'dev' && process.env.UPROOF_CLEAN_NEXT === '1' && existsSync('.next')) {
  rmSync('.next', {recursive: true, force: true});
}

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
