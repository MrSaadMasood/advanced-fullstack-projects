var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MongoClient } from "mongodb";
import env from "./src/zodSchema/envSchema.js";
import { groupChatsCollectionSchema, normalChatsCollectionSchema, tokensCollectionSchema, usersCollectionSchema } from "./validation.js";
const { MONGO_URL } = env;
let database;
const mongourl = MONGO_URL;
// connecting to the database based on the url. and the database we want to connect to
export function connectData(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!mongourl)
                return callback(new Error("mongourl not provided"));
            const connection = yield MongoClient.connect(mongourl);
            database = connection.db("chat-app");
            const collectionList = yield database.listCollections().toArray();
            if (collectionList.length < 4) {
                yield database.createCollection("tokens", {
                    validator: tokensCollectionSchema.validator
                });
                yield database.createCollection("users", {
                    validator: usersCollectionSchema.validator
                });
                yield database.createCollection("normalChats", {
                    validator: normalChatsCollectionSchema.validator
                });
                yield database.createCollection("groupChats", {
                    validator: groupChatsCollectionSchema.validator
                });
            }
            return callback();
        }
        catch (error) {
            return callback(error);
        }
    });
}
export const getData = () => database;
