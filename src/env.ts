import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_DATA_MODE: z.enum(['mock', 'api']).default('mock'),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().default(''),
  NEXT_PUBLIC_ENVIRONMENT: z.enum(['dev', 'demo', 'staging', 'prod']).default('dev'),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_DATA_MODE: process.env.NEXT_PUBLIC_DATA_MODE,
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
});

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables — check .env.local');
}

export const env = parsed.data;
