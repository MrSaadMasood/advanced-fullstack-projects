import Redis from 'ioredis' 
import env from '../zodSchema/envSchema.js'
const { REDIS_PORT, REDIS_HOST, REDIS_PASSWORD } = env
const redis = new Redis({
    port : REDIS_PORT || 6379,
    host : REDIS_HOST || "localhost",
    password : REDIS_PASSWORD || ""  
})

export default redis