import { Db } from "mongodb";
import redisClient from '../redisClient/redisClient' 
import { connectData, getData } from "../../connection";
import path from "path";
import fs from "fs";
import { 
    sendingRequestsTransaction, 
    clientMaker, 
    addFriendTransaction, 
    removeFollowRequestTransaction, 
    removeFriendTransaction, 
    groupChatTransaction, 
    getCustomData, 
    updateGroupChat, 
    deleteMessageFromChat, 
    dataBaseConnectionMaker, 
    chatArraySizeFinder, 
    groupManager, 
    updateNormalChatData,
    incomingDataValidationHandler
 } from "./controllerHelper";
import { logger } from "../logger/conf/loggerConfiguration";
import { Response } from 'express' 
import { fileValidator, generalErrorMessage } from "../utils/utils";
import dotenv from "dotenv"
import { BadRequest } from "../ErrorHandler/customError";
import { CustomRequest } from "../../Types/customRequest";
import env from "../../zodSchema/env";


const currentWorkingDirectory = process.cwd()

dotenv.config()
const { MONGO_URL } = env
const mongoUrl = process.env.TEST_URI || MONGO_URL

let database : Db;
connectData((err)=>{
    if(!err) {
        database = getData()
    }
})

// sends the userData to the client based on the user id
export const getUpdatedData = async(req: CustomRequest, res: Response)=>{
    const { id } = req.user!
    const database = await dataBaseConnectionMaker(process.env.TEST_URI || "")    
    const updatedData = await database.collection<DocumentInput>("users").findOne(
        { _id : id}, { projection : { password : 0}}
    )
    if(!updatedData) throw new BadRequest(generalErrorMessage("failed to get the user data from the database"))
    res.json( updatedData )
}

// get the full name and id of all users from the database
export const getUsersData = async( _req : CustomRequest, res: Response)=>{
    const database = await dataBaseConnectionMaker(process.env.TEST_URI || "")     
    const users = await database.collection<DocumentInput>("users").find({},
        { 
            projection : 
            { 
                fullName : 1,
                profilePicture : 1
            }, 
            sort : 
            { 
                fullName : 1,
            }
        }).toArray()
        
    
    await redisClient.call("json.set", "users", "$", JSON.stringify(users)) 
    console.log("theusers form the cntroller are ", users);
    
    res.json( users )
}

// adds the sender id to the receivers received requests array
export const sendFollowRequest = async( req: CustomRequest, res: Response)=>{
    const { receiverId } = req.body
    const { id } = req.user!
    const client = clientMaker(mongoUrl) 
    await sendingRequestsTransaction(client, id, receiverId)
    logger.info("follow request successfully sent")
    res.json({ message : "request successfully sent"})
}

// get the firends data from the database
export const getFriends = async(req: CustomRequest, res: Response)=>{
    const { id } = req.user!
    const friends = await database.collection<DocumentInput>("users").aggregate(
        [
            {
                $match: {
                _id: id,
                },
            },
            {
                $unwind: "$normalChats",
            },
            {
                $lookup: {
                from: "users",
                localField: "normalChats.friendId",
                foreignField: "_id",
                as: "friendsData",
                },
            },
            {
                $unwind: "$friendsData",
            },
            {
                $project: {
                _id: 0,
                fullName: "$friendsData.fullName",
                profilePicture: "$friendsData.profilePicture",
                collectionId: "$normalChats.collectionId",
                },
            },
        ]).toArray()
    const expirationTime = 86400 - (new Date().getTime()) % 86400
    const key =  `user:friendList:${id}`
    await redisClient.call("json.set", key , "$")
    await redisClient.expire(key, expirationTime)
    res.json( friends )
}

// gets the follow request from the database
export const getFollowRequests = async(req: CustomRequest, res: Response)=>{
    const { id } = req.user!
    const receivedRequests = await getCustomData( database ,id, "receivedRequests")
    return res.json( receivedRequests )
}

// adds the friends to the user
export const addFriend = async(req: CustomRequest, res: Response)=>{
    const { id } = req.user!
    const { friendId } = req.body
    const client = clientMaker(mongoUrl)
    const friendData = await addFriendTransaction(client , id, friendId)
    await redisClient.call("json.arrappend", `user:friendList:${id}`, "$", JSON.stringify(friendData))
    res.json({ message : "friend successfully added"})
}

// removes the friend from the friends array
export const removeFriend = async(req: CustomRequest, res: Response)=>{
    const { id } = req.user!
    const friendId = req.params.id 
    incomingDataValidationHandler(req)
    const client = clientMaker(mongoUrl)
    await removeFriendTransaction(client , id, friendId)
    await redisClient.del(`user:friendList:${id}`)
    res.json({message : "successfully removed friend"})
}

// remove the follow request if one does not want to add the friend
export const removeFollowRequest = async(req: CustomRequest, res: Response) =>{
    const idToRemove = req.params.id
    incomingDataValidationHandler(req)
    const { id } = req.user!
    const client = clientMaker(mongoUrl)
    await removeFollowRequestTransaction( client, id, idToRemove)
    res.json({message : "successfully removed follow request"})
}

// validates the data sent and then adds the chat message to that friends chat collection
export const updateChatData = async (req: CustomRequest, res: Response)=>{
    const { id } = req.user!
    const { content, collectionId } = req.body
    incomingDataValidationHandler(req)
    const randomMessageId = await updateNormalChatData(database, collectionId, id, "content", content)
    res.json({ id : randomMessageId })
} 

// the the chat data with the friend does not exist it throw and error and sends 400 http status
// if the chats exists it checks which friends id matches the friend id in normal chats and
// fetches the data from the "normalChats" collection
export const getChatData = async (req: CustomRequest, res: Response) =>{
    const collectionId = req.params.id
    const { docsSkipCount = 0 } = req.query
    incomingDataValidationHandler(req) 
    const chatArrayCountObject = await chatArraySizeFinder(database, collectionId, "normalChats")
    if(chatArrayCountObject.size < 10){
        logger.info("the chat array has less than 10 messages")
        const chatData = await database.collection<DocumentInput>("normalChats").findOne({ _id : collectionId})
        return res.json(chatData)
    }
    if(parseInt(docsSkipCount as string) > chatArrayCountObject.size) return res.json({ _id : chatArrayCountObject._id, chat : []})
    const chatData = await database.collection<DocumentInput>("normalChats").aggregate(
        [
            {
                $match: {
                _id: chatArrayCountObject._id,
                },
            },
            {
                $unwind: "$chat",
            },
            // {
            //     $skip: chatArrayCountObject.size - parseInt(docsSkipCount),
            // },
            // {
            //     $limit: 10,
            // },
            {
                $project: {
                _id: 0,
                chat: "$chat",
                },
            },
            {
                $replaceRoot: {
                newRoot: "$chat",
                },
            },
            ]
    ).toArray()
    return res.json({ _id : chatArrayCountObject._id, chat : chatData })
}

// uses aggregation pipeline to get the friends name and their last messages sent
export const getChatList = async(req: CustomRequest, res: Response) =>{
    const { id} = req.user!
    const chatList = await database.collection<DocumentInput>("users").aggregate(
    [
        {
            $match: {
            _id: id,
            },
        },
        {
            $unwind: "$normalChats",
        },
        {
            $lookup: {
            from: "users",
            localField: "normalChats.friendId",
            foreignField: "_id",
            as: "friendsData",
            },
        },
        {
            $unwind: "$friendsData",
        },
        {
            $lookup: {
            from: "normalChats",
            localField: "normalChats.collectionId",
            foreignField: "_id",
            as: "messages",
            },
        },
        {
            $unwind: "$messages",
        },
        {
            $addFields: {
            lastMessage: {
                $last: "$messages.chat",
            },
            },
        },
        {
            $project: {
            _id: 1,
            lastMessage: 1,
            friendData: {
                fullName: "$friendsData.fullName",
                _id: "$friendsData._id",
                profilePicture: "$friendsData.profilePicture",
                collectionId: "$normalChats.collectionId",
            },
            },
        },
        ] 
    ).toArray()
    logger.info("chat list successfully collected")
    res.json( chatList )
}

// saves the filename to the database. same as the add message transaction but here the path field is used instead of "content".
export const saveChatImagePath = async (req: CustomRequest, res: Response)=>{
    const { collectionId } = req.body
    const { id } = req.user!
    
    incomingDataValidationHandler(req)
    const filename = fileValidator(req.file)
    const randomMessageId = await updateNormalChatData(database, collectionId, id, "path", filename)
    res.json({ id : randomMessageId, filename : filename })
}

// gets the image from the server static files and sends it
export const getChatImage = (req: CustomRequest, res: Response)=>{
    const { name } = req.params
    incomingDataValidationHandler(req)
    const filepath = path.join(currentWorkingDirectory, `./uploads/chat-images/${name}`)
    res.sendFile(filepath)
}

// updates the bio of the user
export const changeBio = async(req: CustomRequest, res: Response)=>{
    const { id } = req.user!
    const { bio } = req.body
    incomingDataValidationHandler(req) 
    const user = await database.collection<DocumentInput>("users").updateOne(
        {_id : id},
        { $set : { bio : bio}}
    )
    if(!user.modifiedCount) throw new BadRequest(generalErrorMessage("failed to update the bio"))
    res.json({message : "the bio has been successfullly added"})    
}

// adds the profile picture name to the users document
export const saveProfilePicturePath = async (req: CustomRequest, res: Response)=>{
    const { id} = req.user!
    const filename = fileValidator(req.file)
    const addingProfilePicture = await database.collection<DocumentInput>("users").updateOne(
        {_id : id}, 
        { $set : { 
            profilePicture : filename
        }
        }
    )
    if(!addingProfilePicture.modifiedCount) throw new BadRequest(generalErrorMessage("failed to save the profile picture of the user"))

    res.json({ message : "profile picture successfully added"})
}

// gets the static profile picture to the user
export const getProfilePicture  = (req: CustomRequest, res: Response)=>{
    const { name } = req.params
    incomingDataValidationHandler(req)    
    const filepath = path.join(currentWorkingDirectory, `./uploads/profile-images/${name}`)
    res.sendFile(filepath)
}

// deletes the previous profile picture of the user
export const deletePrevProfilePicture = (req: CustomRequest, res: Response)=>{
    const { name } = req.params
    incomingDataValidationHandler(req)    
    fs.unlink(`./uploads/profile-images/${name}`, (err)=>{
        if(err) throw new BadRequest(generalErrorMessage("could not delete the profile picture"))
        return res.json({ message : "picture successully deleted"})
    })

} 

// gets the data of all the friends.
export const getFriendsData = async (req: CustomRequest, res: Response)=>{

    const {id} = req.user!
    const friendsData = await database.collection<DocumentInput>("users").aggregate(
        [
            {
            $match: {
                _id: id,
            },
            },
            {
            $lookup: {
                from: "users",
                localField: "friends",
                foreignField: "_id",
                as: "data",
            },
            },
            {
            $unwind: "$data",
            },
            {
            $project: {
                _id: "$data._id",
                fullName: "$data.fullName",
            },
            },
        ] 
    ).toArray()
    res.json(friendsData)
}

// creates a new group form the given information
export const createNewForm = async (req: CustomRequest, res: Response)=>{
    incomingDataValidationHandler(req) 
    const { members, groupName} = req.body
    const { id} = req.user!
    const filename = fileValidator(req.file)
    const parsedMembers = JSON.parse(members)
    const allMembers = parsedMembers.concat(id)

    const client = clientMaker(mongoUrl)
    await groupChatTransaction(client,id , allMembers , groupName, filename)
    res.json({ message : "the group is successfully created"})
}

// gets the group names and the last message in the group and the username that sent the message
export const getGroupChats = async (req: CustomRequest, res: Response)=>{
    const {id } = req.user!
    const groupChats = await database.collection<DocumentInput>("users").aggregate(
        [
            {
                $match: {
                _id : id
                }
            },
            { $unwind : "$groupChats"},
            {
                $lookup: {
                from: "groupChats",
                localField: "groupChats.collectionId",
                foreignField: "_id",
                as: "chats"
                }
            },
            { $addFields: {
                chat: {
                $arrayElemAt : ["$chats.chat", -1]
                }
            }
            },
            {
                $addFields: {
                lastMessage: {
                    $arrayElemAt : ["$chat", -1]
                }   
                }
            },
            {
                $lookup: {
                from: "users",
                localField: "lastMessage.userId",
                foreignField: "_id",
                as: "senderDataArray"
                }
            },
            {
                $addFields: {
                senderData: {
                    $arrayElemAt : ["$senderDataArray", -1]
                }
                }
            },
            {
                $project : {
                _id : "$groupChats.collectionId",
                groupName : "$groupChats.groupName",
                groupImage : "$groupChats.groupImage",
                lastMessage : "$lastMessage",
                senderName : "$senderData.fullName"
                }
            }
            ]
    ).toArray()

    res.json( groupChats )
}

// sends the group picture to the client
export const getGroupPicture = (req: CustomRequest, res: Response)=>{
    const { name } = req.params
    incomingDataValidationHandler(req)
    const filepath = path.join(currentWorkingDirectory, `./uploads/group-images/${name}`)
    res.sendFile(filepath)
}

export const getGroupMembers = async (req: CustomRequest, res: Response)=>{
    const { collectionId } = req.body
    const { id } = req.user!
    incomingDataValidationHandler(req) 
    const members = await database.collection<DocumentInput>("users").aggregate(
        [
        {
            $match: {
            _id: id,
            },
        },
        {
            $unwind: "$groupChats",
        },
        {
            $lookup: {
            from: "users",
            localField: "groupChats.members",
            foreignField: "_id",
            as: "members",
            },
        },
        {
            $unwind: "$members",
        },
        {
            $match: {
            "groupChats.collectionId": collectionId,
            },
        },
        {
            $project: {
            _id: "$members._id",
            fullName : "$members.fullName",
            profilePicture : "$members.profilePicture"
            },
        },
        ]
    ).toArray()
    res.json(members)
}

export const filterChat = async (req: CustomRequest, res: Response)=>{
    const { date, chatType, groupMemberId, collectionId } = req.body
    incomingDataValidationHandler(req)
    const dateString = new Date(date).toLocaleString(undefined, {
        year : "numeric",
        day : "2-digit",
        month : "2-digit"
    })
    if(chatType === "group"){
        const groupChatData = await database.collection<DocumentInput>("groupChats").aggregate(
        [
            {
                $match: {
                _id: collectionId,
                },
            },
            {
                $unwind: "$chat",
            },
            {
                $lookup: {
                from: "users",
                localField: "chat.userId",
                foreignField: "_id",
                as: "friendData",
                },
            },
            {
                $unwind: "$friendData",
            },
            {
                $project: {
                _id: 1,
                chat: "$chat",
                senderName: "$friendData.fullName",
                messageDate: {
                    $dateToString: {
                    format: "%m/%d/%Y",
                    date: "$chat.time",
                    },
                },
                },
            },
            {
                $match: {
                messageDate: dateString,
                $or : [
                    { "chat.userId" : groupMemberId },
                    { "chat.userId" : { $exists : true}}
                ]
                },
            },
            {
                $project: {
                messageDate: 0,
                },
            },
        ]
        ).toArray()
        logger.info("group chats have been filtered")
        return res.json({ groupChatData, chatType })
    }
    const chatData = await database.collection<DocumentInput>("normalChats").aggregate(
        [
        {
            $match: {
            _id: collectionId, 
            },
        },
        {
            $unwind: "$chat",
        },
        {
            $project: {
            _id: 0,
            chat: "$chat",
            messageDate: {
                $dateToString: {
                format: "%m/%d/%Y",
                date: "$chat.time",
                },
            },
            },
        },
        {
            $match: {
            messageDate: dateString,
            },
        },
        {
            $project: {
            messageDate: 0,
            },
        },
        {
            $replaceRoot: {
            newRoot:  "$chat"
            }
        }
        ]
    ).toArray()
    logger.info("the normal chats have been filtered")
    return res.json({ _id : collectionId, chat : chatData, chatType})
}
// gets all the messages of a specific group chat
export const getGroupChatData = async(req: CustomRequest, res: Response)=>{
    const { chatId } = req.params
    incomingDataValidationHandler(req)
    // const { docsSkipCount = 0 } = req.query
    
        // const chatArrayCountObject = await chatArraySizeFinder(database, chatId , "groupChats")
        // if(chatArrayCountObject.size < 10) {

        // }
        // if(parseInt(docsSkipCount as string) > chatArrayCountObject.size) return res.json([])
    const groupChatData = await database.collection<DocumentInput>("groupChats").aggregate(
        [
            {
                $match: {
                _id: chatId,
                },
            },
            {
            $unwind: "$chat",
        },
        {
            $lookup: {
            from: "users",
            localField: "chat.userId",
            foreignField: "_id",
            as: "senderData",
            },
        },
        {
            $addFields: {
            sender: {
                $arrayElemAt: ["$senderData", -1],
            },
            },
        },
        // {
        //     $skip: chatArrayCountObject.size - parseInt(docsSkipCount),
        // },
        // {
        //     $limit: 10,
        // },
        {
            $project: {
            _id: 1,
            chat: "$chat",
            senderName: "$sender.fullName",
            },
        },
    ]
    ).toArray()

    return res.json( groupChatData )
}

// saves the image name in the chat document
export const saveGroupChatImage = async(req: CustomRequest, res: Response)=>{
    const { id} = req.user!
    const filename = fileValidator(req.file)
    const { groupId } = req.body
    incomingDataValidationHandler(req)
    const result = await updateGroupChat(database, groupId, id, "path", filename )
    return res.json({ filename, id : result})
}

// updates the message send sent in the database
export const updateGroupChatData = async(req: CustomRequest, res: Response)=>{
    const { groupId, content} = req.body
    const { id} = req.user!
    incomingDataValidationHandler(req)
    const result = await updateGroupChat(database, groupId, id, "content", content)
    res.json({ id : result})
}

// depending upon the chat type the collection<DocumentInput>name is decided and the message is deleted from the database
export const deleteMessage = async(req: CustomRequest, res: Response)=>{
    const { collectionId, type, messageId } = req.query
    incomingDataValidationHandler(req)
    const collectionName = type === "normal" ? "normalChats" : "groupChats"
    await deleteMessageFromChat(database,  collectionId as string, messageId as string, collectionName)
    res.json("message successfully deleted")        
}


export const makeMemberAdmin = async (req: CustomRequest, res: Response) =>{
    const { memberId , collectionId } = req.body
    const { id } = req.user!
    incomingDataValidationHandler(req)
    await groupManager(database, "$push" , "admins", memberId, collectionId as string, id)
    res.json({message : "successfully made admin"})     
}

export const removeGroupAdmin = async (req: CustomRequest, res: Response)=>{
    const { memberId, collectionId } = req.query
    const { id } = req.user!
    incomingDataValidationHandler(req)
    await groupManager(database, "$pull", "admins", memberId as string, collectionId as string, id)
    res.json({ message : "the admin has been successfullly removed"})
}

export const removeMemberFromGroup = async (req: CustomRequest, res: Response)=>{
    const { memberId, collectionId } = req.query
    const { id } = req.user!
    incomingDataValidationHandler(req)
    await groupManager(database, "$pull", "members", memberId as string, collectionId as string, id)
    res.json({ message : "member successfullly removed"})
}

export const addFriendToGroup = async (req: CustomRequest, res: Response)=>{
    const { friendId, collectionId } = req.body
    incomingDataValidationHandler(req)
    const { id } = req.user!
    await groupManager(database, "$push", "members", friendId, collectionId as string, id)
    res.json({ message : "friend successfulllye added to group"})
}