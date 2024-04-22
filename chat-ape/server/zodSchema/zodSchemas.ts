import { z } from "zod";
import { zodBool, zodString, zodStringArray } from "./zodUtils";

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
})

const tokenSchema = z.object({
    _id : zodString,
    token : zodString
})

export { 
    userSchema,
    tokenSchema
}

