import Redis from 'ioredis' 

const redis = new Redis({
    port : 6379
})

export default redis