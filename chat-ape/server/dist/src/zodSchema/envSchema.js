import { z } from 'zod';
import { zodString, zodUrl } from './zodUtils.js';
import dotenv from 'dotenv';
dotenv.config();
const envSchema = z.object({
    MONGO_URL: zodUrl,
    REDIS_PORT: z.coerce.number().optional(),
    PORT: z.coerce.number(),
    BASE_URL: zodUrl,
    ACCESS_SECRET: zodString,
    REFRESH_SECRET: zodString,
    CROSS_ORIGIN: zodUrl,
    GOOGLE_CLIENT_SECRET: zodString,
    GOOGLE_CLIENT_ID: zodString,
    F2A_SECRET: zodString,
    LOGGER_LEVEL: zodString.optional(),
    REDIS_HOST: zodString.optional(),
    REDIS_PASSWORD: zodString.optional()
});
const env = envSchema.parse(process.env);
export default env;
