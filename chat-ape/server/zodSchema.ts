import { z } from 'zod' 

const zodBool = z.boolean()
const zodStringArray = z.array(z.string())
const zodString = z.string()
const bodySchema = z.object({
    isGoogleUser : zodBool,
    receivedRequests : zodStringArray,
    friends : zodStringArray,
    sentRequests : zodStringArray,
    is2FactorAuthEnabled: zodBool,
    receiverId : zodString,
    friendId : zodString,
    content : zodString,
    collectionId : zodString,
    bio : zodString,
    groupId : zodString
})

const paramSchema = z.object({
    id : zodString, 
    name : zodString,
    chatId : zodString 
})

const querySchema = z.object({
    docsSkipCount : z.coerce.number(),
})