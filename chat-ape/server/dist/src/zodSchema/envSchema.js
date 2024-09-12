import { z } from 'zod';
import { zodString } from './zodUtils.js';
import dotenv from 'dotenv';
dotenv.config();
const envSchema = z.object({
    MONGO_URL: zodString,
    REDIS_PORT: z.string().transform(value => parseInt(value)).optional(),
    PORT: z.string().transform(value => parseInt(value)),
    BASE_URL: zodString,
    ACCESS_SECRET: zodString,
    REFRESH_SECRET: zodString,
    CROSS_ORIGIN: zodString,
    GOOGLE_CLIENT_SECRET: zodString,
    GOOGLE_CLIENT_ID: zodString,
    F2A_SECRET: zodString,
    LOGGER_LEVEL: zodString.optional(),
    REDIS_HOST: zodString.optional(),
    REDIS_PASSWORD: zodString.optional()
});
const env = envSchema.parse(process.env);
export default env;
