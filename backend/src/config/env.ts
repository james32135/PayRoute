import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('3000'),
    POLYGON_RPC_URL: z.string().url().optional(),
    POLYGON_CHAIN_ID: z.string().default('137'),
    KATANA_RPC_URL: z.string().url().optional(),
    KATANA_CHAIN_ID: z.string().default('747474'),
    AGGREGATOR_API_BASE_URL: z.string().url().optional(),
    AGGREGATOR_API_KEY: z.string().optional(),
    FX_API_BASE_URL: z.string().url().optional(),
    FX_API_KEY: z.string().optional(),
    AI_PROVIDER: z.enum(['openai', 'mock']).default('mock'),
    AI_API_KEY: z.string().optional(),
    PRIVADO_WEB_WALLET_URL: z.string().url().optional(),
    PRIVADO_VERIFIER_API_BASE_URL: z.string().url().optional(),
    DATABASE_URL: z.string().optional(),
    NODE_ENV: z.string().optional(),
});

export const config = envSchema.parse(process.env);
