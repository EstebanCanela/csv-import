import type { Config } from 'drizzle-kit';

export default {
  schema: './src/common/database/schema.ts', // Path to schema file
  out: './src/common/database/migrations', // Path to output directory
  dialect: 'postgresql', // Database dialect
  dbCredentials: {
    host: process.env.POSTGRES_HOST || '',
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER || '',
    password: process.env.POSTGRES_PASSWORD || '',
    database: process.env.POSTGRES_DB || '',
    ssl: false,
  },
} satisfies Config;
