import { Db, MongoClient } from "mongodb";
import dotenv from "dotenv"
dotenv.config()

let database : Db ;
const mongourl = process.env.MONGO_URL
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