import express from 'express' 
const router = express.Router()
import {
    addFriend,
    addFriendToGroup,
    changeBio,
    createNewForm,
    deleteMessage,
    deletePrevProfilePicture,
    filterChat,
    getChatData,
    getChatImage,
    getChatList,
    getFollowRequests,
    getFriends,
    getFriendsData,
    getGroupChatData,
    getGroupChats,
    getGroupMembers,
    getGroupPicture,
    getProfilePicture,
    getUpdatedData,
    getUsersData,
    makeMemberAdmin,
    removeFollowRequest,
    removeFriend,
    removeGroupAdmin,
    removeMemberFromGroup,
    saveChatImagePath,
    saveGroupChatImage,
    saveProfilePicturePath,
    sendFollowRequest,
    updateChatData,
    updateGroupChatData, 
} from "../controllers/userController";

const currentWorkingDirectory = process.cwd()

import multer from "multer"
import path from "path"
import { stringValidation, queryValidation, paramValidation } from "../middlewares/AuthMiddlewares"
import { allUsersCache, cachedFriendList } from '../controllers/redisController';
import { imageHandlerMiddleware } from '../middlewares/imageHandler';

// creating a storage instance which will store the images based on the type of the image added to the reques body and also
// generates the random names that dont clash.
const storage = multer.diskStorage({
    destination : (req, file ,  callback)=>{
        let absolutePath : string | undefined;
        if(req.chatImage){
            absolutePath = path.join(currentWorkingDirectory, "./uploads/chat-images")
        }
        if(req.profileImage){
            absolutePath = path.join(currentWorkingDirectory, "./uploads/profile-images")
        }
        if(req.groupImage){
            absolutePath = path.join(currentWorkingDirectory, "./uploads/group-images")
        }
        if(!absolutePath) return callback(new Error, file.filename)
        return callback(null, absolutePath)
    },

    filename : (_req , file, callback)=>{
        const suffix = `${Date.now()}${Math.round(Math.random()* 1E9)}.jpg`
        callback(null, file.fieldname + "-" + suffix)

    }
})

const upload = multer({ storage : storage })

// to get the user data
router.get("/updated-data",  getUpdatedData)

// get data of all users
router.get("/get-users", allUsersCache, getUsersData)

// sending follow request
router.post("/send-request", stringValidation("receiverId") ,  sendFollowRequest)

// get friends data
router.get("/get-friends", cachedFriendList, getFriends)

// get follow requests data
router.get("/follow-requests",  getFollowRequests)

// adds follow request of the user to friends list
router.post("/add-friend", stringValidation("friendId"),  addFriend)

// removes friend from the list
router.delete("/remove-friend/:id", paramValidation("id"),  removeFriend)

// removes the follow request
router.delete("/remove-follow-request/:id", paramValidation("id"),  removeFollowRequest)

// gets the chat data with a particular friend / user
router.get("/get-chat/:id", paramValidation("id") , queryValidation("docsSkipCount") , getChatData )

// adds the message sent by the user to the normal chats collection
router.post("/chat-data", stringValidation("content"), stringValidation("collectionId"),  updateChatData)

// gets the list of all the chats done with users
router.get("/get-chatlist",  getChatList)

// save the image in the chat-images folder and ads the filename to the database
router.post("/add-chat-image", imageHandlerMiddleware("chatImage"), upload.single("image"), stringValidation("collectionId") ,saveChatImagePath)

// saves the profile image to adds filename to the database
router.post("/add-profile-image", imageHandlerMiddleware("profileImage"), upload.single("image"),  saveProfilePicturePath)

// sends the chat images to the user 
router.get("/get-chat-image/:name", paramValidation("name"), getChatImage )

// gets the profile picture 
router.get("/get-profile-picture/:name", paramValidation("name"), getProfilePicture )

// saves the bio of the user to the database
router.post("/change-bio", stringValidation("bio"),  changeBio)

// gets the friends data
router.get("/get-friends-data",  getFriendsData)

// for creating a new group
router.post("/create-new-group", imageHandlerMiddleware("groupImage"), upload.single("image") ,  createNewForm)

// get list of all the group chats ever done
router.get("/group-chats",  getGroupChats)

// to get the group picture
router.get("/group-picture/:name", paramValidation("name"),  getGroupPicture)

// get all the messages of a specific group chat
router.get("/get-group-chat/:chatId",paramValidation("chatId"),  getGroupChatData)

// adds image sent inside the group chat
router.post("/add-group-chat-image", imageHandlerMiddleware("groupImage"), upload.single("image"), stringValidation("groupId"), saveGroupChatImage)

// saves the message sent in group chat in the database
router.post("/group-data", stringValidation("content"), stringValidation("groupId") ,updateGroupChatData)

router.post("/group-members", stringValidation("collectionId"),  getGroupMembers)

router.post("/filter-chat", stringValidation("date"), stringValidation("chatType"), stringValidation("collectionId"),  filterChat)

// deletes a specific message from either the normal chat or group chat
router.delete("/delete-message", queryValidation("collectionId"), queryValidation("type"), queryValidation("messageId") , deleteMessage)

// deletes the previous profile picture of the user
router.delete("/delete-previous-profile-picture/:name", paramValidation("name"),  deletePrevProfilePicture)

router.delete(`/remove-group-member`, queryValidation("collectionId"), queryValidation("memberId"),  removeMemberFromGroup )

router.put(`/make-member-admin`, stringValidation("memberId"), stringValidation("collectionId"),   makeMemberAdmin)

router.delete(`/remove-group-admin`, queryValidation("memberId"), queryValidation("collectionId"),  removeGroupAdmin)

router.put("/add-group-member" , stringValidation("friendId"), stringValidation("collectionId"),  addFriendToGroup)

export default router
