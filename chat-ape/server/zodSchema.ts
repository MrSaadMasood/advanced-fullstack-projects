import { z } from 'zod' 

const zodBool = z.boolean()
const zodStringArray = z.array(z.string())

const bodySchema = z.object({
    isGoogleUser : zodBool,
    receivedRequests : zodStringArray,
    friends : zodStringArray,
    sentRequests : zodStringArray,
    is2FactorAuthEnabled: zodBool,
    
})