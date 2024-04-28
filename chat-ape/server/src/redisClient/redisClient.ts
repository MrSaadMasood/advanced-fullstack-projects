import Redis from 'ioredis' 
import env from '../../zodSchema/envSchema'
const { REDIS_PORT } = env
const redis = new Redis({
    port : REDIS_PORT || 6379 
})

export default redis