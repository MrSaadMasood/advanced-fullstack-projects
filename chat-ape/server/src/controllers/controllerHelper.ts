import { Db, MongoClient, UpdateOptions } from "mongodb"
import { randomUUID } from "node:crypto"
import { BadRequest } from "../ErrorHandler/customError.js"
import { generalErrorMessage, generalInputValidationError } from "../utils/utils.js"
import { Request } from "express"
import { validationResult } from "express-validator"

const transactionOptions: UpdateOptions = {
  writeConcern: { w: "majority" },
}

// a tranasaction where the senders sent requests array and the receivers receive request array are updated in an atomic way
async function sendingRequestsTransaction(client: MongoClient, senderId: string, receiverId: string) {

  const session = client.startSession()

  try {
    session.startTransaction()
    const database = client.db("chat-app")

    await database.collection<DocumentInput>("users").updateOne({ _id: senderId }, {
      $push: { sentRequests: receiverId }
    }, transactionOptions)

    await database.collection<DocumentInput>("users").updateOne({ _id: receiverId }, {
      $push: { receivedRequests: senderId }
    }, transactionOptions)

    await session.commitTransaction()
    return true
  } catch (error) {
    await session.abortTransaction()
    throw new BadRequest(generalErrorMessage("failed to send the follow requests"))
  }
  finally {
    await session.endSession()
  }

}

// it adds the friend id to the users friends array and removes the friend id from the recerived requests array
// removes the id from sent request of the friend and adds the user id to the friends array
async function addFriendTransaction(client: MongoClient, acceptorId: string, friendId: string) {
  const session = client.startSession()
  const normalChatsCollectonId = randomUUID()
  try {
    session.startTransaction()
    const database = client.db("chat-app")
    await receivedRequestsRemoveAndAddFriend(database, acceptorId, friendId, normalChatsCollectonId)
    await sentRequestsRemoveAndAddFriend(database, friendId, acceptorId, normalChatsCollectonId)
    await database.collection<DocumentInput>("normalChats").insertOne(
      {
        _id: normalChatsCollectonId, chat: [{
          userId: randomUUID(),
          time: new Date(),
          content: "You are now friends",
          id: randomUUID()
        }]
      },
    )
    const friendData = await database.collection<DocumentInput>("users").findOne(
      { _id: friendId },
      {
        projection: {
          fullName: 1,
          profilePicture: 1,
          collectionId: normalChatsCollectonId
        }
      }
    )

    const userData = await database.collection<DocumentInput>("users").findOne(
      { _id: acceptorId },
      {
        projection: {
          fullName: 1,
          profilePicture: 1,
          collectionId: normalChatsCollectonId
        }
      }
    )
    if (!friendData || !userData) throw new Error
    await session.commitTransaction()
    return { userData, friendData }
  } catch (error) {
    await session.abortTransaction()
    throw new BadRequest(generalErrorMessage("failed to add friend"))
  }
  finally {
    await session.endSession()
  }
}

// removes the friend from the friends array from both the user and the other friend
async function removeFriendTransaction
  (client: MongoClient,
    userId: string,
    idToRemove: string,
    collectionId: string
  ) {
  const session = client.startSession()
  try {
    session.startTransaction()
    const database = client.db("chat-app")
    const modifiedUser = await database.collection<DocumentInput>("users").updateOne(
      { _id: userId },
      { $pull: { friends: idToRemove, normalChats: { friendId: idToRemove } } },
      transactionOptions
    )

    const modifiedFriend = await database.collection<DocumentInput>("users").updateOne(
      { _id: idToRemove },
      { $pull: { friends: userId, normalChats: { friendId: userId } } },
      transactionOptions
    )

    const deletedDocument = await database.collection<DocumentInput>("normalChats").deleteOne({ _id: collectionId })
    if (!deletedDocument.deletedCount || !modifiedFriend.modifiedCount || !modifiedUser.modifiedCount) throw new Error
    await session.commitTransaction()
    return true
  } catch (error) {

    await session.abortTransaction()
    throw new BadRequest(generalErrorMessage("failed to remove friend"))
  }
  finally {
    await session.endSession()
  }
}

// removes the users id from the sent requests and the sender ids from the received requests array
async function removeFollowRequestTransaction(client: MongoClient, userId: string, idToRemove: string) {
  const session = client.startSession()
  try {
    session.startTransaction()
    const database = client.db("chat-app")
    const updateAppUser = await database.collection<DocumentInput>("users").updateOne(
      { _id: userId },
      { $pull: { receivedRequests: idToRemove } }
    )
    const updatedRequestSender = await database.collection<DocumentInput>("users").updateOne(
      { _id: idToRemove },
      { $pull: { sentRequests: userId } }
    )

    if (!updateAppUser.modifiedCount || !updatedRequestSender.modifiedCount) throw new Error
    await session.commitTransaction()
    return true
  } catch (error) {
    await session.abortTransaction()
    throw new BadRequest(generalErrorMessage("failed to remove friend"))
  }
  finally {
    await session.endSession()
  }
}


// updates the normal chats array and adds the friend id and the "normalChats" collection document id in the array
async function receivedRequestsRemoveAndAddFriend(database: Db, userId: string, friendId: string, chatId: string) {
  await database.collection<DocumentInput>("users").updateOne(
    { _id: userId },
    {
      $push: {
        friends: friendId,
        normalChats: {
          friendId: friendId,
          collectionId: chatId
        }

      },
      $pull: { receivedRequests: friendId }
    }, transactionOptions
  )
}

async function sentRequestsRemoveAndAddFriend(database: Db, userId: string, friendId: string, chatId: string) {
  await database.collection<DocumentInput>("users").updateOne(
    { _id: userId },
    {
      $push: {
        friends: friendId,
        normalChats: {
          friendId: friendId,
          collectionId: chatId
        }

      },
      $pull: { sentRequests: friendId }
    }, transactionOptions
  )

}

// creates a new group and adds a messages to in the chat and then adds the id of the document in the "groupChats" collection
// to all the members in the members array
// if group image is not provided null is added in the field
async function groupChatTransaction(
  client: MongoClient, userId: string, members: string[], groupName: string, groupImage?: string
) {
  const session = client.startSession()
  try {
    session.startTransaction()
    const database = client.db("chat-app")
    const randomId = randomUUID()
    await database.collection<DocumentInput>("groupChats").insertOne(
      {
        _id: randomId,
        chat: [
          {
            id: randomUUID(),
            userId: userId,
            time: new Date(),
            content: "You have been added in the group."
          }
        ]
      }
    )
    await database.collection<DocumentInput>("users").updateMany(
      { _id: { $in: members } },
      {
        $push: {
          groupChats: {
            id: randomUUID(),
            members: members,
            admins: [
              userId
            ],
            collectionId: randomId,
            groupName: groupName,
            groupImage: groupImage || null
          }
        }
      }
    )
    await session.commitTransaction()
    return true
  } catch (error) {
    await session.abortTransaction()
    throw new BadRequest(generalErrorMessage("failed to create a new group"))
  }
  finally {
    await session.endSession()
  }
}

async function updateNormalChatData
  (database: Db, collectionId: string, senderId: string, contentType: string, content: string) {
  const randomObjectId = randomUUID()

  const updateNormalChatData = await database.collection<Omit<DocumentInput, "chat">>("normalChats").updateOne(
    { _id: collectionId },
    {
      $push: {
        chat: {
          userId: senderId,
          [contentType]: content,
          time: new Date(),
          id: randomObjectId
        }
      }
    },
  )
  if (!updateNormalChatData.modifiedCount) throw new BadRequest(generalErrorMessage("failed to update the normal chat"))
  return randomObjectId
}
// gets used to get the friends and received requests based on type provided
async function getCustomData(database: Db, userId: string, type: FriendsNRequests) {

  const userFromDatabase = await database.collection<DocumentInput>("users").findOne({ _id: userId })
  if (!userFromDatabase) throw new BadRequest(generalErrorMessage("failed to get the user data from database"))
  const data = await database.collection<DocumentInput>("users").find(
    {
      _id: { $in: userFromDatabase[type] }
    },
    {
      projection: {
        fullName: 1,
        profilePicture: 1
      }
    }
  ).toArray()
  return data
}

// updates the groupChats document based on the content type provided either is it "path" for images or "content"/ normal message
async function updateGroupChat
  (database: Db, collectionId: string, userId: string, contentType: string, content: string) {
  const randomId = randomUUID()
  const updated = await database.collection<Omit<DocumentInput, "chat">>("groupChats").updateOne(
    {
      _id: collectionId
    },
    {
      $push: {
        chat: {
          [contentType]: content,
          id: randomId,
          userId: userId,
          time: new Date()
        }
      }
    }
  )
  if (!updated.modifiedCount) throw new BadRequest(generalErrorMessage("failed to add message to the group"))
  return randomId
}


// deletes the specific message based on the collection name
async function deleteMessageFromChat(database: Db, collectionId: string, messageId: string, collectionName: string) {
  const deletedMessage = await database.collection<DocumentInput>(collectionName).updateOne(
    { _id: collectionId },
    {
      $pull: {
        chat: {
          id: messageId
        }
      }
    }
  )
  if (!deletedMessage.modifiedCount) throw new Error

  return true
}

async function chatArraySizeFinder(database: Db, collectionId: string, collectionName: string) {
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

  if (!chatArrayCount) throw new Error
  return chatArrayCount[0]
}

async function groupManager(
  database: Db,
  operationType: OperationType,
  arrayType: OperatedArray,
  memberId: string,
  collectionId: string,
  userId: string
) {

  const arrayToPerformOperation = `groupChats.$.${arrayType}`
  const updatedGroup = await database.collection<DocumentInput>("users").updateOne(
    { _id: userId, "groupChats.collectionId": collectionId },
    {
      [operationType]: {
        [arrayToPerformOperation]: memberId
      }
    }
  )
  if (!updatedGroup.modifiedCount) throw new Error
  return updatedGroup
}

function clientMaker(url: string) {
  return new MongoClient(url)
}

async function dataBaseConnectionMaker(url: string) {
  const client = new MongoClient(url)
  await client.connect()
  const database = client.db("chat-app")
  return database
}

function incomingDataValidationHandler(req: Request) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) throw new BadRequest(generalInputValidationError)
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
  updateNormalChatData,
  incomingDataValidationHandler
}
