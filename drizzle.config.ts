import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// This tells Drizzle to look specifically in your local env file
config({ path: '.env.local' });

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});