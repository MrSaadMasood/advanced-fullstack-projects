const {  MongoClient } = require("mongodb");
const { connectData , getData} = require("../connection");
const { validationResult } = require("express-validator");
const path = require("path")
const fs = require("fs");
const { 
    sendingRequestsTransaction, 
    clientMaker, 
    addFriendTransaction, 
    removeFollowRequestTransaction, 
    removeFriendTransaction, 
    updateChatMessageTransaction, 
    groupChatTransaction, 
    getCustomData, 
    updateGroupChat, 
    deleteMessageFromChat, 
    dataBaseConnectionMaker
} = require("./controllerHelpers");

const mongoUrl = process.env.MONGO_URL

let database;
connectData((err)=>{
    if(!err) {
        database = getData()
    }
})

// sends the userData to the client based on the user id
exports.getUpdatedData = async(req, res)=>{
    const { id } = req.user
    try {
        const updatedData = await database.collection("users").findOne(
            { _id : id}, { projection : { password : 0, email : 0}}
        )
        if(!updatedData) throw new Error
        res.json( updatedData )
    } catch (error) {
        res.status(400).json({ error : "could not get the updated user"})
    }
}

// get the full name and id of all users from the database
exports.getUsersData = async(req, res)=>{
    try {
        const users = await database.collection("users").find({},
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
        
        if(!users) throw new Error
        res.json( users )
    } catch (error) {
        res.status(400).json({ error : "error occured while getting users"})
    }
}

// adds the sender id to the receivers received requests array
exports.sendFollowRequest = async( req, res)=>{
    const { receiverId } = req.body
    const { id } = req.user
    const client = clientMaker(mongoUrl) 
    const result = await sendingRequestsTransaction(client, id, receiverId)
    if(result){
        res.json({ message : "request successfully sent"})
    }
    else {
        res.status(400).json({ error : "cannot sent the request"})
    }
}

// get the firends data from the database
exports.getFriends = async(req, res)=>{
    const { id } = req.user
    const friends = await getCustomData(database, id, "friends")
    if(friends && friends.length > 0){
        res.json( friends )
    }
    else {
        res.status(400).json({ error : "failed to get friends"})
    }
}

// gets the follow request from the database
exports.getFollowRequests = async(req, res)=>{
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
exports.addFriend = async(req, res)=>{
    const { id } = req.user
    const { friendId } = req.body
    const client = clientMaker(mongoUrl)
    const result = await addFriendTransaction(client , id, friendId)
    if(result){
        res.json({message : "successfully added friend"})
    }
    else {
        res.status(400).json({ error : "failed to add friend"})
    }
}

// removes the friend from the friends array
exports.removeFriend = async(req, res)=>{
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
exports.removeFollowRequest = async(req, res) =>{
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
exports.updateChatData = async (req, res)=>{
    const { id} = req.user
    const { friendId, content } = req.body
    console.log("the request has now been received and isbeing processed");
    const passed = validationResult(req)

        if(passed.isEmpty()){
            
            const client = clientMaker(mongoUrl) 
            const result = await updateChatMessageTransaction(client, id, friendId, content)
            console.log("the request has been completed");
            if(result){
                res.json({ id : result})
            }
            else {
                res.status(400).json({ error : "failed to add chat"})
            }
        }
        else {
            res.status(400).json({ error : "the form was not submitted correctly"})
        }
}

// the the chat data with the friend does not exist it throw and error and sends 400 http status
// if the chats exists it checks which friends id matches the friend id in normal chats and
// fetches the data from the "normalChats" collection
exports.getChatData = async (req, res) =>{
    const { id} = req.user
    const friendId  = req.params.id
    try {
        const user = await database.collection("users").findOne({ _id : id})
        if( !user.normalChats ){
            return res.status(400).json({ error : "no chats are present in the database"})
        }
        if( user.normalChats){

            for(let i = 0; i < user.normalChats.length; i++){
                const iter = user.normalChats[i]
                if(iter.friendId === friendId){
                    const chatData = await database.collection("normalChats").findOne(
                        { _id : iter.collectionId}
                    )
                    return res.json({ chatData})
                }
            }
        }
        throw new Error
    } catch (error) {
        res.status(400).json({ error : "could not collect chat data"})
    }
}

// uses aggregation pipeline to get the friends name and their last messages sent
exports.getChatList = async(req, res) =>{
    const { id} = req.user
    try {
        const user = await database.collection("users").findOne({ _id : id})
        if(!user.normalChats) throw new Error
        const chatList = await database.collection("users").aggregate(
            [
                {
                  $match: {
                    _id:  id,
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
                  $lookup: {
                    from: "normalChats",
                    localField: "normalChats.collectionId",
                    foreignField: "_id",
                    as: "messages",
                  },
                },
                {
                  $addFields: {
                    lastMessages: {
                      $arrayElemAt: ["$messages.chat", -1],
                    },
                  },
                },
                {
                  $addFields: {
                    lastMessage: {
                      $arrayElemAt: ["$lastMessages", -1],
                    },
                    friendData: {
                      $arrayElemAt: ["$friendsData", -1],
                    },
                  },
                },
                {
                  $project: {
                    _id: 1,
                    lastMessage: 1,
                    friendData: {
                      fullName: "$friendData.fullName",
                      _id : "$friendData._id",
                      profilePicture : "$friendData.profilePicture"
                    },
                  },
                },
              ]
        ).toArray()

        if(!chatList) throw new Error
        res.json( chatList )
    } catch (error) {
        res.status(400).json({ error : "failed to get the chat list"})
    }
}

// saves the filename to the database. same as the add message transaction but here the path field is used instead of "content".
exports.saveChatImagePath = async (req, res)=>{
    const { friendId} = req.body
    const { id } = req.user
    const { filename } = req.file
    const filePath = filename
    const client = clientMaker(mongoUrl)
    const result = await updateChatMessageTransaction(client, id, friendId, filePath ,"path")

    if(result){
        res.json({ filename : filename, id : result})
    }
    else {
        res.status(400).json({ error : "failed to add image"})
    }
}

// gets the image from the server static files and sends it
exports.getChatImage = (req, res)=>{
    const { name } = req.params
    const filepath = path.join(__dirname, `../uploads/chat-images/${name}`)
    res.sendFile(filepath)
}

// updates the bio of the user
exports.changeBio = async(req, res)=>{
    const { id } = req.user
    const { bio } = req.body
    const result = validationResult(req)
    try {
        if(result.isEmpty()){
            const user = await database.collection("users").updateOne(
                {_id : id},
                { $set : { bio : bio}}
            )
            if(!user) throw new Error
            res.json({message : "the bio has been successfullly added"})    
        }else throw new Error
    } catch (error) {
        res.status(400).json({ error : "bio update failed"})
    }
}

// adds the profile picture name to the users document
exports.saveProfilePicturePath = async (req, res)=>{
    const { id} = req.user
    const { filename } = req.file
    try {
        const addingProfilePicture = await database.collection("users").updateOne(
            {_id : id}, 
            { $set : { 
                profilePicture : filename
            }
            }
        )
        if(!addingProfilePicture) throw new Error

        res.json({ message : "profile picture successfully added"})
    } catch (error) {
        res.status(400).json({error: "cannot update the profile picture"})
    }
}

// gets the static profile picture to the user
exports.getProfilePicture  = (req, res)=>{
    const { name } = req.params
    const filepath = path.join(__dirname, `../uploads/profile-images/${name}`)
    res.sendFile(filepath)
}

// deletes the previous profile picture of the user
exports.deletePrevProfilePicture = (req, res)=>{
    const { name } = req.params
    fs.unlink(`./uploads/profile-images/${name}`, (err)=>{
        if(err){
            return res.status(400).json({ error : "some error occured"}) 
        }
        res.json({ message : "picture successully deleted"})
    })

} 

// gets the data of all the friends.
exports.getFriendsData = async (req, res)=>{

    const {id} = req.user
    try {
        const friendsData = await database.collection("users").aggregate(
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

        if(!friendsData) throw new Error

        res.json(friendsData)
    } catch (error) {
        res.status(400).json({error : "could not get the friendds data"})
    }
}

// creates a new group form the given information
exports.createNewForm = async (req, res)=>{
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
exports.getGroupChats = async (req, res)=>{
    const {id } = req.user
    try {
        const groupChats = await database.collection("users").aggregate(
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
exports.getGroupPicture = (req, res)=>{
    const { name } = req.params
    const filepath = path.join(__dirname, `../uploads/group-images/${name}`)
    res.sendFile(filepath)
}

// gets all the messages of a specific group chat
exports.getGroupChatData = async(req, res)=>{
    const { chatId} = req.params
    try {
        const groupChatData = await database.collection("groupChats").aggregate(
            [
                {
                  $match: {
                    _id: chatId ,
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

        res.json({ groupChatData})
    } catch (error) {
        res.status(400).json({ error : "failed to get the group chat data"})
    }
}

// saves the image name in the chat document
exports.saveGroupChatImage = async(req, res)=>{
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
exports.updateGroupChatData = async(req, res)=>{
    const { groupId, content} = req.body
    const { id} = req.user
    const result = await updateGroupChat(database,groupId, id, "content", content)
    
    if(result){
            res.json({ id : result})
        }
    else{
            res.status(400).json({error : "failed to update the group chat"})
        }
}

// depending upon the chat type the collection name is decided and the message is deleted from the database
exports.deleteMessage = async(req, res)=>{
    const { collectionId, type, messageId } = JSON.parse(req.query.data)
    const collectionName = type === "normal" ? "normalChats" : "groupChats"
    const result = await deleteMessageFromChat(database, collectionId, messageId, collectionName)
    if(result){
        res.json({ message : "successfully deleted the message"})
    }
    else{
        res.status(400).json({error : "failed to delete the message"})
    }
}
