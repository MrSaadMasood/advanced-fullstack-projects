import { Db, MongoClient, UpdateOptions } from "mongodb"
import { randomUUID } from "crypto"

const transactionOptions : UpdateOptions = {
    writeConcern : { w : "majority"},
}

// a tranasaction where the senders sent requests array and the receivers receive request array are updated in an atomic way
async function sendingRequestsTransaction(client : MongoClient, senderId : string, receiverId : string){

    const session = client.startSession()

    try {
        session.startTransaction()
        const database = client.db("chat-app")

        await database.collection<DocumentInput>("users").updateOne({ _id : senderId}, {
            $push : {sentRequests : receiverId}
        }, transactionOptions)

        await database.collection<DocumentInput>("users").updateOne({ _id : receiverId}, { 
            $push : { receivedRequests : senderId}
        }, transactionOptions)

        await session.commitTransaction()
        return true
    } catch (error) {
       await session.abortTransaction() 
       return false
    }
    finally{
        await session.endSession()
    }

}

// it adds the friend id to the users friends array and removes the friend id from the recerived requests array
// removes the id from sent request of the friend and adds the user id to the friends array
async function addFriendTransaction( client : MongoClient, acceptorId : string, friendId : string){
    const session = client.startSession()
    const normalChatsCollectonId = randomUUID()
    try {
        session.startTransaction()
        const database = client.db("chat-app")
        await pushAddFriendChanges(database, acceptorId, friendId, normalChatsCollectonId)
        await pushAddFriendChanges(database, friendId, acceptorId, normalChatsCollectonId)
        await database.collection<DocumentInput>("normalChats").insertOne(
            { _id : normalChatsCollectonId , chat : [{
                userId : randomUUID(),
                time : new Date(),
                content : "You are now friends",
                id : randomUUID() 
            }]
        },
        )
        await session.commitTransaction()
        return true
    } catch (error) {
        await session.abortTransaction()
        return false
    }
    finally {
        await session.endSession()
    }
}

// removes the friend from the friends array from both the user and the other friend
async function removeFriendTransaction(client : MongoClient, userId : string, idToRemove : string){
    const session = client.startSession()
    try {
        session.startTransaction()
        const database = client.db("chat-app")
        
        await database.collection<DocumentInput>("users").updateOne(
            { _id : userId}, 
            { $pull : { friends : idToRemove}},
            transactionOptions
        )

        await database.collection<DocumentInput>("users").updateOne(
            { _id : idToRemove},
            { $pull : { friends : userId} },
            transactionOptions
        )

        await session.commitTransaction()
        return true
    } catch (error) {
        console.log("transaction to remove the friend failed")
        await session.abortTransaction()
        return false
    }
    finally {
        await session.endSession()
    }
}

// removes the users id from the sent requests and the sender ids from the received requests array
async function removeFollowRequestTransaction(client : MongoClient, userId : string, idToRemove : string){
    const session = client.startSession()
    try {
        session.startTransaction()
        const database = client.db("chat-app")
        
        await database.collection<DocumentInput>("users").updateOne(
            { _id : userId},
            { $pull : { receivedRequests : idToRemove}}
        )

        await database.collection<DocumentInput>("users").updateOne(
            { _id : idToRemove},
            { $pull : { sentRequests : userId}}
        )

        await session.commitTransaction()
        return true
    } catch (error) {
        console.log("error occured while removing the follow request")
        await session.abortTransaction()
        return false
    }
    finally{
        session.endSession()
    }
}


// updates the normal chats array and adds the friend id and the "normalChats" collection document id in the array
async function pushAddFriendChanges(database : Db, userId : string ,friendId : string, chatId : string){
    try {
        await database.collection<DocumentInput>("users").updateOne(
            { _id : userId},
            {
                $push : { 
                    friends : friendId,
                    normalChats : {
                    friendId : friendId,
                    collectionId : chatId
                }

                    },
                $pull : { receivedRequests : friendId}
            }, transactionOptions
        )
    } catch (error) {
        throw new Error(error as string)
    }
}

// creates a new group and adds a messages to in the chat and then adds the id of the document in the "groupChats" collection
// to all the members in the members array
// if group image is not provided null is added in the field
async function groupChatTransaction(
    client : MongoClient, userId : string, members : string[], groupName : string, groupImage : string
    ){
    const filename = groupImage ? groupImage : null
    const session = client.startSession()
    try {
        session.startTransaction()
        const database = client.db("chat-app")
        const randomId = randomUUID()
        await database.collection<DocumentInput>("groupChats").insertOne(
            {   _id : randomId,
                chat : [
                    {
                        id : randomUUID(),
                        userId : userId,
                        time : new Date(),
                        content : "You have been added in the group."
                    }
                ]
             }
        )
        await database.collection<DocumentInput>("users").updateMany(
            { _id : { $in : members }},
            {
                $push : {
                    groupChats : { 
                            id : randomUUID(),
                            members : members,
                            admins : [
                                userId
                            ],
                            collectionId : randomId,
                            groupName : groupName,
                            groupImage : filename
                    }
                }
            }
        )
        session.commitTransaction()
        return true
    } catch (error) {
        session.abortTransaction()
        return false
    }
    finally {
        session.endSession()
    }
}

async function updateNormalChatData
    (database : Db, collectionId : string ,senderId : string, contentType : string, content : string)
    {
    try {
        const randomObjectId = randomUUID()

        await database.collection<Omit<DocumentInput, "chat">>("normalChats").updateOne(
            { _id : collectionId},
            {
                $push : {
                    chat : {
                        userId : senderId,
                        [contentType] : content,
                        time : new Date(),
                        id : randomObjectId 
                    }
                }
            },
        )
        return randomObjectId
    } catch (error) {
        throw new Error("failed to update the normal chat")
    }
}
// gets used to get the friends and received requests based on type provided
async function getCustomData (database : Db, userId : string, type : string) {

    try {
        const user = await database.collection("users").findOne({ _id : userId})
        if(!user) throw new Error
        const data = await database.collection<DocumentInput>("users").find(
        {
            _id : { $in : user[type]}
        },
        {
            projection : {
                fullName : 1,
                profilePicture : 1
            }
        }
       ).toArray()
       if(!data) throw new Error
       return data
    } catch (error) {
       console.log("cannot get the custom data") 
       return
    }
}

// updates the groupChats document based on the content type provided either is it "path" for images or "content"/ normal message
async function updateGroupChat
    (database : Db, collectionId : string, userId : string, contentType : string, content : string)
    {
    try {
        const randomId = randomUUID()
        const updated = await database.collection<Omit<DocumentInput, "chat">>("groupChats").updateOne(
            {
                _id : collectionId
            },
            { $push : {
                chat : {
                    [contentType ] : content,
                    id : randomId,
                    userId : userId,
                    time : new Date()
                }
            }}
        )
        if(!updated) throw new Error

        return randomId
    } catch (error) {
        return false
    }
}


// deletes the specific message based on the collection name
async function deleteMessageFromChat(database : Db, collectionId : string, messageId : string, collectionName : string){
    try {
        const deletedMessage = await database.collection<DocumentInput>(collectionName).updateOne(
            {_id : collectionId},
            { $pull : {
                chat : {
                    id : messageId
                } 
            } 
        }
        )
        if(!deletedMessage) throw new Error
            
        return true
    } catch (error) {
        return false
    }
}

async function chatArraySizeFinder(database : Db, collectionId : string , collectionName : string){
    try {
        const chatArrayCount = await database.collection<DocumentInput>(collectionName).aggregate(
            [
                {
                    $match: {
                    _id: collectionId,
                    },
                },
                {
                    $project: {
                    size: {
                        $size: "$chat",
                    },
                    },
                },
            ]
        ).toArray()
        if(!chatArrayCount) throw new Error
        return chatArrayCount[0]
    } catch (error) {
        console.log("failed to get the size of the chat Array")
        throw new Error
    }
}

async function groupManager(
    database : Db, 
    operationType: operationType , 
    arrayType: operatedArray, 
    memberId : string, 
    collectionId : string, 
    userId: string){
    const arrayToPerformOperation = `groupChats.$.${arrayType}`
    try {
        console.log(operationType, arrayToPerformOperation, memberId, collectionId, userId);
        const updatedGroup = await database.collection<DocumentInput>("users").updateOne(
            {_id : userId , "groupChats.collectionId" : collectionId},
            { [operationType] : {
              [arrayToPerformOperation] : memberId
            }}
        )
        console.log("the updated group is", updatedGroup)
        if(!updatedGroup.modifiedCount) throw new Error
        return updatedGroup
    } catch (error) {
        throw new Error
    }
}

function clientMaker(url : string){
    return new MongoClient(url)
}

async function dataBaseConnectionMaker(url : string){
    const client = new MongoClient(url)
    await client.connect()
    const database = client.db("chat-app")
    return database
}

export { 
    sendingRequestsTransaction,
    addFriendTransaction,
    removeFollowRequestTransaction,
    removeFriendTransaction,
    clientMaker,
    groupChatTransaction,
    getCustomData,
    updateGroupChat,
    deleteMessageFromChat,
    dataBaseConnectionMaker,
    chatArraySizeFinder,
    groupManager,
    updateNormalChatData
}