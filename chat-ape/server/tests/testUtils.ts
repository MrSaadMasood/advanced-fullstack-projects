import { MongoMemoryServer } from "mongodb-memory-server"
import jwt from 'jsonwebtoken' 
import { MongoClient} from "mongodb"
import { 
    usersCollectionSchema, 
    tokensCollectionSchema, 
    normalChatsCollectionSchema, 
    groupChatsCollectionSchema 
} from "../validation"
    
import { users, groupChats, normalChats} from "./sampleData"
import dotenv from 'dotenv' 
// import env from "../zodSchema/env"
dotenv.config()
const { F2A_SECRET = "randomF2a", REFRESH_SECRET = "randomRefresh" } = process.env

const res = {
    json : jest.fn((value : any)=> value),
    status : jest.fn().mockReturnThis(),
    sendStatus : jest.fn(),
    sendFile : jest.fn()
}

const req = {
    body : {
        id : "test",
        receiverId : "test",
        friendId : "test",
        content : "testContent",
        bio : "testing",
        groupName : "testGroup",
        members : JSON.stringify([1, 2, 3]),
        groupId : "test"
    },
    user : {
        id : "test"
    },
    params : {
        id : "test",
        name : "testFile.jpg",
        chatId : "testChatId"
    },
    file : {
        filename : "testFile.jpg"
    },
    query : {
        data : JSON.stringify({
        messageId : "test",
        collectionId : "test",
        type : "normal"
        })
    }
}
const errorDbObject = {
            updateOne : jest.fn(()=> false),
            findOne : jest.fn(()=> false),
            insertOne : jest.fn(()=> ({
                insertedId : "string"
            })),
            updateMany : jest.fn(()=> false),
            find : jest.fn().mockReturnThis(),
            toArray : jest.fn(()=> false)
        }

const dbObject = {
            updateOne : jest.fn(()=> true),
            findOne : jest.fn(()=> ({})),
            insertOne : jest.fn(()=> ({
                insertedId : "string"
            })),
            updateMany : jest.fn(()=> true),
            find : jest.fn().mockReturnThis(),
            toArray : jest.fn(()=> true)
        }

const sessionObject = { 
        startTransaction : jest.fn(),
        commitTransaction : jest.fn(),
        abortTransaction : jest.fn(),
        endSession : jest.fn()
    }

const client = {
    startSession : jest.fn(()=> (sessionObject)),
    db : jest.fn(()=>({
        collection : jest.fn(()=>(dbObject))
    }))

}

const errorClient = {
    startSession : jest.fn(()=> (sessionObject)),
    db : jest.fn(()=>({
        collection : jest.fn(()=>(errorDbObject))
    }))

}

const database = client.db()
const errorDatabase = errorClient.db()

const googleTokens = {
    refresh_token : "google refresh token",
    access_token : "google access token",
    id_token : "google id token"
}
const signUpWithGoogleCode = "googleCode"

let mongoServer : MongoMemoryServer; 
let connection : MongoClient;

const sampleRefreshToken = `${jwt.sign({ _id : "12121"}, REFRESH_SECRET)}`
const intermediaryToken = `Bearer ${jwt.sign({ email : "tester@gmail.com"}, F2A_SECRET)}`
const googleUserIntermediaryToken = `Bearer ${jwt.sign({ email : "Otilia_Hessel89@hotmail.com"}, F2A_SECRET)}`

async function dbConnection(){
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    connection = await MongoClient.connect(uri)
    process.env.TEST_URI = uri
    console.log("the connection function is running");
     
    const database = connection.db("chat-app")
    await database.createCollection("users", usersCollectionSchema)
    await database.createCollection("tokens", tokensCollectionSchema)
    await database.createCollection("normalChats", normalChatsCollectionSchema)
    await database.createCollection("groupChats", groupChatsCollectionSchema)
    await database.collection<DocumentInput>("users").insertMany(users);
    await database.collection<MongoId>("normalChats").insertMany(normalChats)
    await database.collection<MongoId>("groupChats").insertMany(groupChats)
    await database.collection("tokens").insertOne({ token : sampleRefreshToken})
}

async function dbDisconnect(){
    if(connection) await connection.close()
    if(mongoServer) await mongoServer.stop()
}

export {
    req,
    res, 
    client, 
    database, 
    errorClient , 
    errorDatabase,
    dbConnection,
    dbDisconnect,
    sampleRefreshToken,
    googleTokens,
    signUpWithGoogleCode,
    intermediaryToken,
    googleUserIntermediaryToken
}