import { NextFunction, Response } from "express";
import redisClient from "../redisClient/redisClient";  
import { CustomRequest } from "../../Types/customRequest";

export const allUsersCache = async (_req : CustomRequest, res : Response, next : NextFunction ) => {

    const areUsersCached : AllUsersData[] = JSON.parse(await redisClient.call("json.get", "users", "$") as string)
    
    if(areUsersCached) return res.json(areUsersCached.flat())
    return next()
}

export const cachedFriendList = async (req : CustomRequest, res : Response, next : NextFunction ) => {
    
    const { id } = req.user!
    const cachedFriendList : AllUsersData[] = JSON.parse(await redisClient.call("json.get", `user:friendList:${id}`, "$") as string)
    if(cachedFriendList) return res.json(cachedFriendList.flat())
    return next()
}