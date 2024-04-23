import { Db, MongoClient } from "mongodb";
import env from "./zodSchema/envSchema";

const { TEST_URI, MONGO_URL } = env
let database : Db ;
const mongourl = TEST_URI || MONGO_URL
// connecting to the database based on the url. and the database we want to connect to
export async function connectData( callback: ConnectDataCallback) {
    try {
        if(!mongourl) return callback(new Error("mongourl not provided"))
        const connection = await MongoClient.connect(mongourl)
        database = connection.db("chat-app")
        return callback()
    } catch (error) {
        return callback(error as Error)  
    }
}
export const getData = () => database