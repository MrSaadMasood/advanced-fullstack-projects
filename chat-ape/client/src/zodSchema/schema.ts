import { z } from "zod";
import { zodBool, zodString, zodStringArray } from "./zodUtils";

const idSchema = z.object({
    _id : zodString
})

const messageSchema = z.object({
    userId : zodString,  
    time : zodString, 
    id : zodString,
    path : zodString.optional(),
    content : zodString.optional(),
    error : zodBool.optional()
})

const assessoryData = idSchema.extend({
    fullName : zodString,
    profilePicture : zodString.nullable()
})
const assessoryDataArraySchema = z.array(assessoryData).default([])

const friendDataSchema = assessoryData.extend({
    collectionId : zodString,
    type : z.literal("normal").optional()
})

const normalChatSchema = idSchema.extend({
    lastMessage : messageSchema,
    friendData : friendDataSchema
})

const normalChatListSchema = z.array(normalChatSchema).default([])
const friendListSchema = z.array(friendDataSchema).default([])
const groupChatSchema = idSchema.extend({
    groupName : zodString,
    groupImage : zodString.nullable(),
    senderName : zodString,
    lastMessage : messageSchema,
})
const groupChatListSchema = z.array(groupChatSchema).default([])

const userNormalChat = z.object({
        friendId : zodString,
        collectionId : zodString
    })

const userGroupChat = z.object({
    id : zodString,
    members : zodStringArray,
    admins : zodStringArray,
    collectionId : zodString,
    groupName : zodString,
    groupImage : zodString.nullable()
})

const userSchema = z.object({
    _id : zodString, 
    fullName: zodString,
    email: zodString.email(),
    password: zodString,
    friends: zodStringArray.default([]), 
    receivedRequests: zodStringArray.default([]),
    sentRequests: zodStringArray.default([]),
    profilePicture : zodString.nullable(),
    isGoogleUser : zodBool,
    is2FactorAuthEnabled : zodBool,
    factor2AuthSecret : zodString,
    normalChats : z.array(userNormalChat).default([]),
    groupChats : z.array(userGroupChat).default([])
})

const authSchema = z.object({
    isGoogleUser : zodBool,
    refreshToken : zodString
})

const f2aEnableSchema = z.object({
        factor2AuthToken : zodString, 
        is2FactorAuthEnabled : zodBool,
})

const factor2LoginSchema = authSchema.extend({
    accessToken : zodString, 
    is2FactorAuthEnabled : zodBool,
})

const loginUserSchema = authSchema.merge(factor2LoginSchema).extend({
        factor2AuthToken : zodString.optional(), 
})

const normalId = z.object({
    id : zodString
})

const imageSaveSchema = normalId.extend({
    filename : zodString
}) 

const normalChatDataSchema = idSchema.extend({
    chat : z.array(messageSchema)
})

const groupChatData = idSchema.extend({
    senderName : zodString,
    chat : messageSchema 
})
const groupChatDataArraySchema = z.array( groupChatData )

export {
    groupChatData,
    userNormalChat,
    messageSchema,
    userGroupChat,
    groupChatDataArraySchema,
    normalChatDataSchema,
    normalId,
    imageSaveSchema,
    loginUserSchema,
    factor2LoginSchema,
    f2aEnableSchema,
    userSchema,
    groupChatListSchema,
    friendListSchema,
    normalChatListSchema,
    normalChatSchema,
    groupChatSchema,
    assessoryData,
    assessoryDataArraySchema,
    friendDataSchema
}