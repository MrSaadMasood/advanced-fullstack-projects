import { Db, MongoClient } from "mongodb";
import env from "./src/zodSchema/envSchema.js";
import { groupChatsCollectionSchema, normalChatsCollectionSchema, tokensCollectionSchema, usersCollectionSchema } from "./validation.js";

const { MONGO_URL } = env
let database : Db ;
const mongourl =  MONGO_URL
// connecting to the database based on the url. and the database we want to connect to
export async function connectData( callback: ConnectDataCallback) {
    try {
        if(!mongourl) return callback(new Error("mongourl not provided"))
        const connection = await MongoClient.connect(mongourl)
        database = connection.db("chat-app")
        const collectionList = await database.listCollections().toArray()
        if(collectionList.length < 4) {
            await database.createCollection("tokens", {
                validator : tokensCollectionSchema.validator
            })
            await database.createCollection("users", {
                validator : usersCollectionSchema.validator
            })
            await database.createCollection("normalChats", {
                validator : normalChatsCollectionSchema.validator
            }) 
            await database.createCollection("groupChats", {
                validator : groupChatsCollectionSchema.validator
            })
        }
        return callback()
    } catch (error) {
        return callback(error as Error)  
    }
}
export const getData = () => database