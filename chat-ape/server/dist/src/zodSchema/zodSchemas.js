import { z } from "zod";
import { zodBool, zodString, zodStringArray } from "./zodUtils.js";
const userNormalChat = z.object({
    friendId: zodString,
    collectionId: zodString
});
const userGroupChat = z.object({
    id: zodString,
    members: zodStringArray,
    admins: zodStringArray,
    collectionId: zodString,
    groupName: zodString,
    groupImage: zodString.nullable()
});
const userSchema = z.object({
    _id: zodString,
    fullName: zodString,
    email: zodString.email(),
    password: zodString,
    friends: zodStringArray.default([]),
    receivedRequests: zodStringArray.default([]),
    sentRequests: zodStringArray.default([]),
    profilePicture: zodString.nullable(),
    isGoogleUser: zodBool,
    is2FactorAuthEnabled: zodBool,
    factor2AuthSecret: zodString,
    normalChats: z.array(userNormalChat).default([]),
    groupChats: z.array(userGroupChat).default([])
});
const tokenSchema = z.object({
    _id: zodString,
    token: zodString
});
export { userSchema, tokenSchema };
