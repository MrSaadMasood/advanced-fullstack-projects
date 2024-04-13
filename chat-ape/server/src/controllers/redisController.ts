import { NextFunction, Request, Response } from "express";
import redisClient from "../redisClient/redisClient";  

export const allUsersCache = async (_req : Request, res : Response, next : NextFunction ) => {

    const areUsersCached : Users[] = JSON.parse(await redisClient.call("json.get", "users", "$") as string)
    if(areUsersCached) return res.json(areUsersCached)
    return next()
}

export const cachedFriendList = async (req : Request, res : Response, next : NextFunction ) => {
    
    const { id } = req.user
    const cachedFriendList : Users[] = JSON.parse(await redisClient.call("json.get", `user:friendList:${id}`, "$") as string)
    if(cachedFriendList) return res.json(cachedFriendList)
    return next()
}