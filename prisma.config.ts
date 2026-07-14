import {config as loadEnv} from 'dotenv';
import { defineConfig } from "prisma/config";

loadEnv({path: '.env.website.local'});
loadEnv({path: '.env.crm.local'});

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: requireEnv('DATABASE_URL'),
    directUrl: requireEnv('DIRECT_URL'),
  },
});
