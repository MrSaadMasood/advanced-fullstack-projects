const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController.js")
const { body } = require("express-validator")
const multer = require("multer")
const path = require("path")

// creating a storage instance which will store the images based on the type of the image added to the reques body and also
// generates the random names that dont clash.
const storage = multer.diskStorage({
    destination : (req, file, callback)=>{
        let absolutePath;

        if(req.chatImage){
            absolutePath = path.join(__dirname, "../uploads/chat-images")
        }
        if(req.profileImage){
            absolutePath = path.join(__dirname, "../uploads/profile-images")
        }
        if(req.groupImage){
            absolutePath = path.join(__dirname , "../uploads/group-images")
        }
        callback(null, absolutePath)
    },

    filename : (req, file, callback)=>{
        const suffix = `${Date.now()}${Math.round(Math.random()* 1E9)}.jpg`
        callback(null, file.fieldname + "-" + suffix)

    }
})

const upload = multer({ storage : storage })

const stringValidation  = (string)=> body(string).isString().trim().escape()
// to get the user data
router.get("/updated-data", userController.getUpdatedData)

// get data of all users
router.get("/get-users", userController.getUsersData)

// sending follow request
router.post("/send-request", userController.sendFollowRequest)

// get friends data
router.get("/get-friends", userController.getFriends)

// get follow requests data
router.get("/follow-requests", userController.getFollowRequests)

// adds follow request of the user to friends list
router.post("/add-friend", userController.addFriend)

// removes friend from the list
router.delete("/remove-friend/:id", userController.removeFriend)

// removes the follow request
router.delete("/remove-follow-request/:id", userController.removeFollowRequest)

// gets the chat data with a particular friend / user
router.get("/get-chat/:id", userController.getChatData )

// adds the message sent by the user to the normal chats collection
router.post("/chat-data", stringValidation("content"), userController.updateChatData)

// gets the list of all the chats done with users
router.get("/get-chatlist", userController.getChatList)

// save the image in the chat-images folder and ads the filename to the database
router.post("/add-chat-image",(req, _, next)=>{ req.chatImage = true ; next()}, upload.single("image"), userController.saveChatImagePath)

// saves the profile image to adds filename to the database
router.post("/add-profile-image", (req,_,next)=>{ req.profileImage = true; next()} , upload.single("image"), userController.saveProfilePicturePath)

// sends the chat images to the user 
router.get("/get-chat-image/:name", userController.getChatImage )

// gets the profile picture 
router.get("/get-profile-picture/:name", userController.getProfilePicture )

// saves the bio of the user to the database
router.post("/change-bio", stringValidation("bio"), userController.changeBio)

// gets the friends data
router.get("/get-friends-data", userController.getFriendsData)

// for creating a new group
router.post("/create-new-group",(req,_,next)=>{ req.groupImage = true; next()}, upload.single("image") , userController.createNewForm)

// get list of all the group chats ever done
router.get("/group-chats", userController.getGroupChats)

// to get the group picture
router.get("/group-picture/:name", userController.getGroupPicture)

// get all the messages of a specific group chat
router.get("/get-group-chat/:chatId", userController.getGroupChatData)

// adds image sent inside the group chat
router.post("/add-group-chat-image", (req,_,next)=>{ req.groupImage = true; next()}, upload.single("image"), userController.saveGroupChatImage)

// saves the message sent in group chat in the database
router.post("/group-data", stringValidation("content"), userController.updateGroupChatData)

// deletes a specific message from either the normal chat or group chat
router.delete("/delete-message", userController.deleteMessage)

// deletes the previous profile picture of the user
router.delete("/delete-previous-profile-picture/:name", userController.deletePrevProfilePicture)

module.exports = router
