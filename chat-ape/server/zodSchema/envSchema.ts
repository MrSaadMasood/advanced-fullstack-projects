import { z } from 'zod' 
import { zodString, zodUrl } from './zodUtils'
import dotenv from 'dotenv' 
dotenv.config()

const envSchema = z.object({
    MONGO_URL : zodUrl,
    TEST_URI : zodString.optional(),
    PORT : z.coerce.number(),
    BASE_URL : zodUrl,
    ACCESS_SECRET : zodString,
    REFRESH_SECRET : zodString,
    CROSS_ORIGIN : zodUrl,
    TEST_ACCESS_TOKEN : zodString,
    TEST_REFRESH_TOKEN : zodString,
    GOOGLE_CLIENT_SECRET : zodString,
    GOOGLE_CLIENT_ID : zodString,
    GOOGLE_PUBLIC_KEY : zodString,
    F2A_SECRET : zodString,
    LOGGER_LEVEL  : zodString.optional()
})

const env = envSchema.parse(process.env)

export default env

