import { z } from 'zod' 

const zodString = z.string()
const zodUrl = z.string().url()

const envSchema = z.object({
    MONGO_URL : zodUrl,
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
    F2A_SECRET : zodString
})

const env = envSchema.parse(process.env)

export default env

