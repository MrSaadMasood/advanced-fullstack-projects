var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import redisClient from "../redisClient/redisClient.js";
export const allUsersCache = (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const areUsersCached = JSON.parse(yield redisClient.call("json.get", "users", "$"));
    if (areUsersCached)
        return res.json(areUsersCached.flat());
    return next();
});
export const cachedFriendList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const cachedFriendList = JSON.parse(yield redisClient.call("json.get", `user:friendList:${id}`, "$"));
    if (cachedFriendList)
        return res.json(cachedFriendList.flat());
    return next();
});
