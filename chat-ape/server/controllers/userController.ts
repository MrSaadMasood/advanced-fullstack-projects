import { Db, MongoClient } from "mongodb";
import { connectData, getData } from "../connection";
import { validationResult } from "express-validator";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
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
    updateNormalChatData
 } from "./controllerHelpers";
import { logger } from "../logger/conf/loggerConfiguration";
import { Request, Response } from 'express' 
const mongoUrl = process.env.MONGO_URL

let database : Db;
connectData((err)=>{
    if(!err) {
        database = getData()
    }
})

// sends the userData to the client based on the user id
exports.getUpdatedData = async(req: Request, res: Response)=>{
    const { id } = req.user
    try {
        const updatedData = await database.collection<DocumentInput>("users").findOne(
            { _id : id}, { projection : { password : 0}}
        )
        if(!updatedData) throw new Error("failed to get the user data from the database")
        res.json( updatedData )
    } catch (error) {
        res.status(400).json({ error : "could not get the updated user"})
    }
}

// get the full name and id of all users from the database
exports.getUsersData = async( _ : Request, res: Response)=>{
    try {
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
            })
            .toArray()
        
        if(!users) throw new Error("failed to get all users data")
        res.json( users )
    } catch (error) {
        res.status(400).json({ error : "error occured while getting users"})
    }
}

// adds the sender id to the receivers received requests array
exports.sendFollowRequest = async( req: Request, res: Response)=>{
    const { receiverId } = req.body
    const { id } = req.user
    const client = clientMaker(mongoUrl) 
    const result = await sendingRequestsTransaction(client, id, receiverId)
    if(result){
        logger.info("follow request successfully sent")
        res.json({ message : "request successfully sent"})
    }
    else {
        res.status(400).json({ error : "cannot sent the request"})
    }
}

// get the firends data from the database
exports.getFriends = async(req: Request, res: Response)=>{
    const { id } = req.user
    try {
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

        res.json( friends )
    } catch (error) {
        res.status(400).json({ error : "failed to get friends"})
    }
}

// gets the follow request from the database
exports.getFollowRequests = async(req: Request, res: Response)=>{
    const { id } = req.user
    const receivedRequests = await getCustomData( database ,id, "receivedRequests")
    if(receivedRequests && receivedRequests.length > 0){
        return res.json( receivedRequests )
    }
    else {
        return res.status(400).json({ error : "failed to get the follow requests" })
    }
}

// adds the friends to the user
exports.addFriend = async(req: Request, res: Response)=>{
    const { id } = req.user
    const { friendId } = req.body
    const client = clientMaker(mongoUrl)
    const result = await addFriendTransaction(client , id, friendId)
    if(result){
        res.json({ message : "friend successfully added"})
    }
    else {
        res.status(400).json({ error : "failed to add friend"})
    }
}

// removes the friend from the friends array
exports.removeFriend = async(req: Request, res: Response)=>{
    const { id } = req.user
    const friendId = req.params.id 
    const client = clientMaker(mongoUrl)
    const result = await removeFriendTransaction(client , id, friendId)

    if(result){
        res.json({message : "successfully removed friend"})
    }
    else {
        res.status(400).json({ error : "failed to remove friend"})
    }
}

// remove the follow request if one does not want to add the friend
exports.removeFollowRequest = async(req: Request, res: Response) =>{
    const idToRemove = req.params.id
    const { id } = req.user
    const client = clientMaker(mongoUrl)
    const result = await removeFollowRequestTransaction( client, id, idToRemove)
    if(result){
        res.json({message : "successfully removed follow request"})
    }
    else {
        res.status(400).json({ error : "failed to remove follow request"})
    }
}

// validates the data sent and then adds the chat message to that friends chat collection
exports.updateChatData = async (req: Request, res: Response)=>{
    const { id } = req.user
    const { content, collectionId } = req.body
    const passed = validationResult(req)
        try {
            if(passed.isEmpty()){
                const randomMessageId = await updateNormalChatData(database, collectionId, id, "content", content)
                res.json({ id : randomMessageId })
            }
            else throw new Error("failed to update normal chat with text")
        } 
        catch (error) {
            res.status(400).json({ error : "the form was not submitted correctly"})
        }
}

// the the chat data with the friend does not exist it throw and error and sends 400 http status
// if the chats exists it checks which friends id matches the friend id in normal chats and
// fetches the data from the "normalChats" collection
exports.getChatData = async (req: Request, res: Response) =>{
    const collectionId = req.params.id
    const { docsSkipCount } = req.query
    try {

        const chatArrayCountObject = await chatArraySizeFinder(database, collectionId, "normalChats")
        if(chatArrayCountObject.size < 10){
            logger.info("the chat array has less than 10 messages")
            const chatData = await database.collection<DocumentInput>("normalChats").findOne({ _id : collectionId})
            return res.json(chatData)
        }
        if(docsSkipCount > chatArrayCountObject.size) return res.json({ _id : chatArrayCountObject._id, chat : []})
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
        if(!chatData) throw new Error
        return res.json({ _id : chatArrayCountObject._id, chat : chatData })
    }
    catch (error) {
        res.status(400).json({ error : "failed to get the chat data"})
    }
}

// uses aggregation pipeline to get the friends name and their last messages sent
exports.getChatList = async(req: Request, res: Response) =>{
    const { id} = req.user
    try {
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

        if(!chatList) throw new Error("failed to get the chat list")
        logger.info("chat list successfully collected")
        res.json( chatList )
    } catch (error) {
        res.status(400).json({ error : "failed to get the chat list"})
    }
}

// saves the filename to the database. same as the add message transaction but here the path field is used instead of "content".
exports.saveChatImagePath = async (req: Request, res: Response)=>{
    const { collectionId } = req.body
    const { id } = req.user
    const { filename : filePath} = req.file
    try {
        const randomMessageId = await updateNormalChatData(database, collectionId, id, "path", filePath)
        res.json({ id : randomMessageId, filename : filePath })
    } catch (error) {
        res.status(400).json({ error : "failed to add image"})
    }
}

// gets the image from the server static files and sends it
exports.getChatImage = (req: Request, res: Response)=>{
    const { name } = req.params
    const filepath = path.join(__dirname, `../uploads/chat-images/${name}`)
    res.sendFile(filepath)
}

// updates the bio of the user
exports.changeBio = async(req: Request, res: Response)=>{
    const { id } = req.user
    const { bio } = req.body
    const result = validationResult(req)
    try {
        if(result.isEmpty()){
            const user = await database.collection<DocumentInput>("users").updateOne(
                {_id : id},
                { $set : { bio : bio}}
            )
            if(!user) throw new Error("failed to update the bio")
            res.json({message : "the bio has been successfullly added"})    
        }else throw new Error("bio input validation error")
    } catch (error) {
        res.status(400).json({ error : "bio update failed"})
    }
}

// adds the profile picture name to the users document
exports.saveProfilePicturePath = async (req: Request, res: Response)=>{
    const { id} = req.user
    const { filename } = req.file
    try {
        const addingProfilePicture = await database.collection<DocumentInput>("users").updateOne(
            {_id : id}, 
            { $set : { 
                profilePicture : filename
            }
            }
        )
        if(!addingProfilePicture) throw new Error("failed to save the profile picture of the user")

        res.json({ message : "profile picture successfully added"})
    } catch (error) {
        res.status(400).json({error: "cannot update the profile picture"})
    }
}

// gets the static profile picture to the user
exports.getProfilePicture  = (req: Request, res: Response)=>{
    const { name } = req.params
    const filepath = path.join(__dirname, `../uploads/profile-images/${name}`)
    res.sendFile(filepath)
}

// deletes the previous profile picture of the user
exports.deletePrevProfilePicture = (req: Request, res: Response)=>{
    const { name } = req.params
    fs.unlink(`./uploads/profile-images/${name}`, (err)=>{
        if(err){
            return res.status(400).json({ error : "some error occured"}) 
        }
        res.json({ message : "picture successully deleted"})
    })

} 

// gets the data of all the friends.
exports.getFriendsData = async (req: Request, res: Response)=>{

    const {id} = req.user
    try {
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
                    _id: 0,
                    _id: "$data._id",
                    fullName: "$data.fullName",
                },
                },
            ] 
        ).toArray()

        if(!friendsData) throw new Error("failed to get the friends Data")

        res.json(friendsData)
    } catch (error) {
        res.status(400).json({error : "could not get the friendds data"})
    }
}

// creates a new group form the given information
exports.createNewForm = async (req: Request, res: Response)=>{
    const result = validationResult(req)
    try {
        if(result.isEmpty()){
            const { members, groupName} = req.body
            const { id} = req.user
            let filename
            if(req.file){
                filename = req.file.filename
            }

            const parsedMembers = JSON.parse(members)
            const allMembers = parsedMembers.concat(id)

            const client = clientMaker(mongoUrl)
            const result = await groupChatTransaction(client,id , allMembers , groupName, filename )
            if(result) {
                res.json({ message : "the group is successfully created"})
            }
            else {
                throw new Error
            }

        }
        else throw new Error
    } catch (error) {
        res.status(400).json({error : "failed to create a new group"})
    }
}

// gets the group names and the last message in the group and the username that sent the message
exports.getGroupChats = async (req: Request, res: Response)=>{
    const {id } = req.user
    try {
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

        if(!groupChats) throw new Error

        res.json( groupChats )
    } catch (error) {
        res.status(400).json({ error : "cannot get the group chats list"})
    }
}

// sends the group picture to the client
exports.getGroupPicture = (req: Request, res: Response)=>{
    const { name } = req.params
    const filepath = path.join(__dirname, `../uploads/group-images/${name}`)
    res.sendFile(filepath)
}

exports.getGroupMembers = async (req: Request, res: Response)=>{
    const { collectionId } = req.body
    const { id } = req.user
    try {
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
    } catch (error) {
        res.status(400).json({ error : "failed to get the group members"})
    }
}

exports.filterChat = async (req: Request, res: Response)=>{
    const { date, chatType, groupMemberId, collectionId } = req.body
    const result = validationResult(req)
    const dateString = new Date(date).toLocaleString(undefined, {
        year : "numeric",
        day : "2-digit",
        month : "2-digit"
    })
    try {
        if(result.isEmpty()){
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
                if(!groupChatData) throw new Error
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
            if(!chatData) throw new Error
            logger.info("the normal chats have been filtered")
            res.json({ _id : collectionId, chat : chatData, chatType})
        }
        else throw new Error
    } catch (error) {
        res.status(400).json({ error : "failed to get the filtered chats"}) 
    }
}
// gets all the messages of a specific group chat
exports.getGroupChatData = async(req: Request, res: Response)=>{
    const { chatId } = req.params
    const { docsSkipCount } = req.query
    try {
        const chatArrayCountObject = await chatArraySizeFinder(database, chatId , "groupChats")
        // if(chatArrayCountObject.size < 10) {

        // }
        if(docsSkipCount > chatArrayCountObject.size) return res.json([])
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
        if(!groupChatData) throw new Error

        res.json( groupChatData )
    } catch (error) {
        res.status(400).json({ error : "failed to get the group chat data"})
    }
}

// saves the image name in the chat document
exports.saveGroupChatImage = async(req: Request, res: Response)=>{
    const { id} = req.user
    const { filename } = req.file
    const { groupId } = req.body
    const result = await updateGroupChat(database, groupId, id, "path", filename)
    if(result){
        res.json({ filename, id : result})
    }
    else{
        res.status(400).json({error : "failed to update the group chat"})
    }
}

// updates the message send sent in the database
exports.updateGroupChatData = async(req: Request, res: Response)=>{
    const { groupId, content} = req.body
    const { id} = req.user
    const result = await updateGroupChat(database, groupId, id, "content", content)
    
    if(result){
            res.json({ id : result})
        }
    else{
            res.status(400).json({error : "failed to update the group chat"})
        }
}

// depending upon the chat type the collection<DocumentInput>name is decided and the message is deleted from the database
exports.deleteMessage = async(req: Request, res: Response)=>{
    const { collectionId, type, messageId } = JSON.parse(req.query.data)
    const errors = validationResult(req)
    const collectionName = type === "normal" ? "normalChats" : "groupChats"
    const result = await deleteMessageFromChat(database, collectionId, messageId, collectionName)
    if(result){
        res.json({ message : "successfully deleted the message"})
    }
    else{
        res.status(400).json({error : "failed to delete the message"})
    }
}


exports.makeMemberAdmin = async (req: Request, res: Response) =>{
    const { memberId , collectionId } = req.body
    const { id } = req.user
    const result = validationResult(req)
    try {
        if(result.isEmpty()){
            const upatedGroup = await groupManager(database, "$push" , "admins", memberId, collectionId, id)
            res.json({message : "successfully made admin"})     
        }
        else throw new Error
    } catch (error) {
        res.status(400).json({ error : "failed to make the member an admin"})
    } 
}

exports.removeGroupAdmin = async (req: Request, res: Response)=>{
    const { memberId, collectionId } = req.query
    const { id } = req.user
    const error = validationResult(req)
    try {
        if(error.isEmpty()){
            const removeAdmin = await groupManager(database, "$pull", "admins", memberId, collectionId, id)
            res.json({ message : "the admin has been successfullly removed"})
        }
        else throw new Error("failed to remove the group admin")
    } catch (error) {
        res.status(400).json({ error : "failed to remove admin"})
    }
}

exports.removeMemberFromGroup = async (req: Request, res: Response)=>{
    const { memberId, collectionId } = req.query
    const { id } = req.user
    const errors = validationResult(req)
    try {
        if(errors.isEmpty()){
            const removedMember = await groupManager(database, "$pull", "members", memberId, collectionId, id)
            res.json({ message : "member successfullly removed"})
        }
        else throw new Error("failed to remove the member from group")
    } catch (error) {
        res.status(400).json({ error : "failed to remove the member from group"}) 
    }
}

exports.addFriendToGroup = async (req: Request, res: Response)=>{
    const { friendId, collectionId } = req.body
    const { id } = req.user
    const errors = validationResult(req)
    try {   
        if(errors.isEmpty()){
            const addedFriend = await groupManager(database, "$push", "members", friendId, collectionId, id)
            res.json({ message : "friend successfulllye added to group"})
        }
        else throw new Error("failed to add friend to group")
    } catch (error) {
        res.status(400).json({ error : "failed to add friend to group"})
    }
}