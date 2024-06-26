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
} from "../controllers/userController.js";

import { stringValidation, queryValidation, paramValidation } from "../middlewares/AuthMiddlewares.js"
import { allUsersCache, cachedFriendList } from '../controllers/redisController.js';
import { imageHandlerMiddleware } from '../middlewares/imageHandler.js';
import { upload } from '../middlewares/multer.js' 


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
router.delete("/remove-friend/:id", paramValidation("id"), queryValidation("collectionId"), removeFriend)

// removes the follow request
router.delete("/remove-follow-request/:id", paramValidation("id"),  removeFollowRequest)

// gets the chat data with a particular friend / user
router.get("/get-chat/:id", paramValidation("id") , queryValidation("docsSkipCount") , getChatData )

// adds the message sent by the user to the normal chats collection
router.post("/chat-data", stringValidation("content"), stringValidation("collectionId"),  updateChatData)

// gets the list of all the chats done with users
router.get("/get-chatlist",  getChatList)

// save the image in the chat-images folder and ads the filename to the database
router.post("/add-chat-image", imageHandlerMiddleware("chatImage"), upload.single("image"), stringValidation("collectionId") , saveChatImagePath)

// saves the profile image to adds filename to the database
router.post("/add-profile-image", imageHandlerMiddleware("profileImage"), upload.single("image"),  saveProfilePicturePath)

// sends the chat images to the user 
router.get("/get-chat-image/:name", paramValidation("name"), getChatImage )

// gets the profile picture 
router.get("/get-profile-picture/:name", paramValidation("name"), getProfilePicture )

// saves the bio of the user to the database
router.post("/change-bio", stringValidation("bio"),  changeBio)

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

router.get("/group-members/:groupId", paramValidation("groupId"),  getGroupMembers)

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
