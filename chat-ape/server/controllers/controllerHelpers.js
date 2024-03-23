const { MongoClient, } = require("mongodb")
const { getData, connectData } = require("../connection")
const { randomUUID } = require("crypto")

const transactionOptions = {
    writeConcern : { w : "majority"},
    maxCommitTimeMs : 1000
}

// a tranasaction where the senders sent requests array and the receivers receive request array are updated in an atomic way
async function sendingRequestsTransaction(client, senderId, receiverId){

    const session = client.startSession()

    try {
        session.startTransaction()
        const database = client.db("chat-app")

        await database.collection("users").updateOne({ _id : senderId}, {
            $push : {sentRequests : receiverId}
        }, transactionOptions)

        await database.collection("users").updateOne({ _id : receiverId}, { 
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
async function addFriendTransaction( client, acceptorId, friendId){
    const session = client.startSession()
    try {
        session.startTransaction()
        const database = client.db("chat-app")
        await database.collection("users").updateOne(
            { _id : acceptorId},
            {
                    $push : { friends : friendId},
                    $pull : { receivedRequests : friendId}
            }, transactionOptions
        )
        await database.collection("users").updateOne(
            {
                _id : friendId
            },
            {
                    $push : { friends : acceptorId},
                    $pull : { sentRequests : acceptorId}
                }, transactionOptions
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
async function removeFriendTransaction(client, userId, idToRemove){
    const session = client.startSession()
    try {
        session.startTransaction()
        const database = client.db("chat-app")
        
        await database.collection("users").updateOne(
            { _id : userId}, 
            { $pull : { friends : idToRemove}},
            transactionOptions
        )

        await database.collection("users").updateOne(
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
async function removeFollowRequestTransaction(client, userId, idToRemove){
    const session = client.startSession()
    try {
        session.startTransaction()
        const database = client.db("chat-app")
        
        await database.collection("users").updateOne(
            { _id : userId},
            { $pull : { receivedRequests : idToRemove}}
        )

        await database.collection("users").updateOne(
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

// it gets th user and checks if the user normalChats array is present. if present, loop over the users normal chats array
// finds the id that matches the friends id and gets the collection id from that object and updates the collection
// and returns that added objects id in "normalChats" collection
async function updateChatMessageTransaction(client, userId, friendId, content, contentType = "content"){
    const session = client.startSession()
    try {
        session.startTransaction()
        const database = client.db("chat-app")
        const randomObjectId = randomUUID()

        const user = await database.collection("users").findOne({ _id : userId})
        if(user.normalChats){
            const index = user.normalChats.findIndex((element)=>element.friendId === friendId )
            if(index !== -1){
                const collectionId = user.normalChats[index].collectionId
                const chat = await database.collection("normalChats").updateOne(
                    { _id : collectionId},
                    {
                        $push : {
                            chat : {
                                userId : userId,
                                time : new Date(),
                                [contentType] : content,
                                id : randomObjectId 
                            }
                        }
                    },
                    transactionOptions
                )
                await session.commitTransaction()
                return randomObjectId

            }
        }
        
        // if normal chats array does not exist it creates a new document in the "normalChats" collection adds the message to it
        // then adds the Id of the newly created document to both the users and friends normal chats array
        // and returns the id of the newly added message in "normals chats" collection's document
        const newChat = await database.collection("normalChats").insertOne(
            { _id : randomUUID(), chat : [{
                userId : userId,
                time : new Date(),
                [ contentType ] : content,
                id : randomObjectId 
            }]
        },
        transactionOptions
        )   
        const chatId = newChat.insertedId
        const addChatIdToUser = await updateUserNormalChat(database, userId, friendId, chatId)
        const addChatIdToFriend = await updateUserNormalChat(database, friendId, userId , chatId)

        if(!addChatIdToUser || !addChatIdToFriend) throw new Error

        await session.commitTransaction()
        return randomObjectId
    } catch (error) {
        await session.abortTransaction()
        return false
    }
    finally{
        await session.endSession()
    }
}


// updates the normal chats array and adds the friend id and the "normalChats" collection document id in the array
async function updateUserNormalChat(database, userId ,friendId, chatId){
    try {
        const user = await database.collection("users").updateOne(
            { _id : userId},
            { $push : {
                normalChats : {
                    friendId : friendId,
                    collectionId : chatId
                }
            } 
        }
    )
    return true
    } catch (error) {
        console.log("failed to add to the chat", error)
        return false
    }
}

// creates a new group and adds a messages to in the chat and then adds the id of the document in the "groupChats" collection
// to all the members in the members array
// if group image is not provided null is added in the field
async function groupChatTransaction(client, userId, members, groupName, groupImage){
    const filename = groupImage ? groupImage : null
    const session = client.startSession()
    try {
        session.startTransaction()
        const database = client.db("chat-app")
        const randomId = randomUUID()
        const newGroup = await database.collection("groupChats").insertOne(
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
        const updatingUsers = await database.collection("users").updateMany(
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

// gets used to get the friends and received requests based on type provided
async function getCustomData (database, userId, type) {

    try {
        const user = await database.collection("users").findOne({ _id : userId})
       const  data= await database.collection("users").find(
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
async function updateGroupChat(database, collectionId, userId, contentType, content){
    try {
        const randomId = randomUUID()
        const updated = await database.collection("groupChats").updateOne(
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
async function deleteMessageFromChat(database, collectionId, messageId, collectionName){
    try {
        const deletedMessage = await database.collection(collectionName).updateOne(
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

async function chatArraySizeFinder(database, collectionId , collectionName){
    try {
        const chatArrayCount = await database.collection(collectionName).aggregate(
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

async function groupManager(database, operationType, arrayType , memberId, collectionId, userId){
    const arrayToPerformOperation = `groupChats.$.${arrayType}`
    try {
        console.log(operationType, arrayToPerformOperation, memberId, collectionId, userId);
        const updatedGroup = await database.collection("users").updateOne(
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

function clientMaker(url){
    return new MongoClient(url)
}

async function dataBaseConnectionMaker(url){
    const client = new MongoClient(url)
    await client.connect()
    const database = client.db("chat-app")
    return database
}

module.exports = { 
    sendingRequestsTransaction,
    addFriendTransaction,
    removeFollowRequestTransaction,
    removeFriendTransaction,
    updateChatMessageTransaction,
    clientMaker,
    groupChatTransaction,
    getCustomData,
    updateGroupChat,
    deleteMessageFromChat,
    dataBaseConnectionMaker,
    chatArraySizeFinder,
    groupManager
}