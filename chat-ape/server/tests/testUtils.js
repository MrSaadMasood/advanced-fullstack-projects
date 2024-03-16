const { MongoMemoryServer } = require("mongodb-memory-server")
const { MongoClient } = require("mongodb")
const { 
    usersCollectionSchema, 
    tokensCollectionSchema, 
    normalChatsCollectionSchema, 
    groupChatsCollectionSchema } = require("../validation")
const { users, normalChats, groupChats } = require("./sampleData")
require("dotenv").config()
const res = {
    json : jest.fn((value)=> value),
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

const database = client.db("test")
const errorDatabase = errorClient.db("test")


let mongoServer; 
let connection;

async function dbConnection(){
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    connection = await MongoClient.connect(uri)
    process.env.URI = uri
    const database = connection.db("chat-app")
    await database.createCollection("users", usersCollectionSchema)
    await database.createCollection("tokens", tokensCollectionSchema)
    await database.createCollection("normalChats", normalChatsCollectionSchema)
    await database.createCollection("groupChats", groupChatsCollectionSchema)
    await database.collection("users").insertMany(users);
    await database.collection("normalChats").insertMany(normalChats)
    await database.collection("groupChats").insertMany(groupChats)
}

async function dbDisconnect(){
    if(connection) await connection.close()
    if(mongoServer) await mongoServer.stop()
}

module.exports = {
    req,
    res, 
    client, 
    database, 
    errorClient , 
    errorDatabase,
    dbConnection,
    dbDisconnect
}