const { req , res } = require("../testUtils")
const { 
    getUpdatedData, 
    getUsersData, 
    sendFollowRequest, 
    getFriends, 
    getFollowRequests, 
    addFriend, 
    removeFriend, 
    removeFollowRequest, 
    updateChatData, 
    getChatData, 
    getChatList, 
    changeBio, 
    saveProfilePicturePath, 
    getFriendsData, 
    createNewForm, 
    getGroupChats, 
    getGroupChatData, 
    saveGroupChatImage, 
    updateGroupChatData, 
    deleteMessage,
    deletePrevProfilePicture,
    saveChatImagePath } = require("../../controllers/userController") 
const helpers = require("../../controllers/controllerHelpers")

jest.mock("mongodb", ()=>{
    
    const insertOne = jest.fn((value)=> false)
    const findOne = jest.fn()
    const find = jest.fn().mockReturnThis()
    const deleteOne = jest.fn( ()=> ({ deletedCount : 1}))
    const aggregate = jest.fn().mockReturnThis()
    const updateOne = jest.fn()
    const toArray = jest.fn(()=> false)
    const collection = jest.fn((value)=>({
        insertOne,
        findOne,
        deleteOne,
        find,
        aggregate,
        updateOne,
        toArray
    }))
    const database = jest.fn(()=> ({
        collection
    }))

    return {
        MongoClient : {
        connect : jest.fn().mockResolvedValue({
            db : database
        })
        },
        ObjectId : jest.fn().mockReturnValue("string"),
}})

jest.mock("../../controllers/controllerHelpers", ()=>{
    return {
        clientMaker : jest.fn(()=> "string"),
        sendingRequestsTransaction : jest.fn(()=>false ),
        addFriendTransaction : jest.fn(()=>false ),
        removeFriendTransaction : jest.fn(()=>false ),
        removeFollowRequestTransaction : jest.fn(()=>false ),
        updateChatMessageTransaction : jest.fn(()=>false ),       
        groupChatTransaction : jest.fn(()=>false ),
        getCustomData : jest.fn(()=> []),
        updateGroupChat : jest.fn(()=> false),
        deleteMessageFromChat : jest.fn(()=> false),
        convertStringArrayToObjectIdsArray : jest.fn(()=> [])
    }
})

jest.mock("fs", ()=>{
    const originalModule = jest.requireActual("fs")
    return {
        ...originalModule,
        unlink : jest.fn((string, callback)=> callback(true))
    }
})

afterEach(()=> jest.clearAllMocks() )

describe("test if errors are handles correctly in userControllers", ()=>{
    
    it("tests the getUpdatedData function", async ()=>{
        
        await getUpdatedData(req, res)
        
        expect(res.status).toHaveBeenCalled()
        expect(res.json).toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith({ error : "could not get the updated user"})
        expect(res.status).toHaveBeenCalledWith(400)
    })

    it("tests the getUsersData function ", async ()=>{

        await getUsersData( {} , res )

        expect(res.status).toHaveBeenCalled()
        expect(res.json).toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith({ error : "error occured while getting users"})
        expect(res.status).toHaveBeenCalledWith(400)
    })

    it("tests the sendFollowRequest", async ()=>{
        const transactionSpy = jest.spyOn( helpers , "sendingRequestsTransaction")
        const clientSpy = jest.spyOn(helpers, "clientMaker")

        await sendFollowRequest(req, res)
        
        expect(res.status).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(400)
        expect(transactionSpy).toHaveBeenCalledTimes(1)
        expect(clientSpy).toHaveBeenCalledTimes(1)
        expect(res.json).toHaveBeenCalledWith({ error : "cannot sent the request"})
    })

    it("tests the getFriendsUser", async ()=>{
        await getFriends(req, res)

        expect(res.json).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({ error : "failed to get friends"})
    })

    it("tests the getFollowRequests", async ()=>{
        await getFollowRequests(req, res)

        expect(res.json).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({ error : "failed to get the follow requests"})
    })
    
    it("tests the addFriend function", async ()=>{
        const transactionSpy = jest.spyOn( helpers , "addFriendTransaction")
        const clientSpy = jest.spyOn(helpers, "clientMaker")

        await addFriend(req, res)
        
        expect(res.status).toHaveBeenCalled()
        expect(transactionSpy).toHaveBeenCalledTimes(1)
        expect(clientSpy).toHaveBeenCalledTimes(1)
        expect(res.json).toHaveBeenCalledWith({error : "failed to add friend"})
    })

    it("tests the removeFriend function", async ()=>{
        const transactionSpy = jest.spyOn( helpers , "removeFriendTransaction")
        const clientSpy = jest.spyOn(helpers, "clientMaker")

        await removeFriend(req, res)
        
        expect(res.status).toHaveBeenCalled()
        expect(transactionSpy).toHaveBeenCalledTimes(1)
        expect(clientSpy).toHaveBeenCalledTimes(1)
        expect(res.json).toHaveBeenCalledWith({ error : "failed to remove friend"})
    })

    it("tests the  removeFollowRequest function", async ()=>{
        const transactionSpy = jest.spyOn( helpers , "removeFollowRequestTransaction")
        const clientSpy = jest.spyOn(helpers, "clientMaker")

        await removeFollowRequest(req, res)
        
        expect(res.status).toHaveBeenCalled()
        expect(transactionSpy).toHaveBeenCalledTimes(1)
        expect(clientSpy).toHaveBeenCalledTimes(1)
        expect(res.json).toHaveBeenCalledWith({ error : "failed to remove follow request"})
        })

    it("tests the  updateChatData function", async ()=>{
        const transactionSpy = jest.spyOn( helpers , "updateChatMessageTransaction")
        const clientSpy = jest.spyOn(helpers, "clientMaker")

        await updateChatData(req, res)
        
        expect(res.status).toHaveBeenCalled()
        expect(transactionSpy).toHaveBeenCalledTimes(1)
        expect(clientSpy).toHaveBeenCalledTimes(1)
        expect(res.json).toHaveBeenCalledWith({ error : "failed to add chat"})

        await saveChatImagePath(req, res)

        expect(res.status).toHaveBeenCalled()
        expect(transactionSpy).toHaveBeenCalledTimes(2)
        expect(clientSpy).toHaveBeenCalledTimes(2)
        expect(res.json).toHaveBeenCalledWith({ error : "failed to add image"})
        })

    it("tests the getChatData function", async ()=>{

        await getChatData(req, res)

        expect(res.status).toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith( {
            error : "could not collect chat data"
        })
        expect(res.status).toHaveBeenCalledWith(400)
    })

    it("tests the getChatList function", async ()=>{
        
        await getChatList(req, res)

        expect(res.status).toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith({ error : "failed to get the chat list"})
        expect(res.status).toHaveBeenCalledWith(400)
    })

    it("tests the  saveChatImage function", async ()=>{
        const transactionSpy = jest.spyOn( helpers , "updateChatMessageTransaction")
        const clientSpy = jest.spyOn(helpers, "clientMaker")

        await updateChatData(req, res)
        
        expect(res.status).toHaveBeenCalled()
        expect(transactionSpy).toHaveBeenCalledTimes(1)
        expect(clientSpy).toHaveBeenCalledTimes(1)
        expect(res.json).toHaveBeenCalledWith({ error : "failed to add chat"})
        expect(res.status).toHaveBeenCalledWith(400)
        })
    
    it("tests the ChangeBio function", async ()=>{

        await changeBio(req, res)

        expect(res.json).toHaveBeenCalledWith({ error : "bio update failed"})
        expect(res.status).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(400)
    })
    
    it("tests the saveProfilePicturePath function", async ()=>{

        await saveProfilePicturePath(req, res)

        expect(res.json).toHaveBeenCalledWith({error: "cannot update the profile picture"})
        expect(res.status).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(400)
    })

    it("tests the getFriendData function", async ()=>{

        await getFriendsData(req, res)

        expect(res.json).toHaveBeenCalledWith({error : "could not get the friendds data"})
        expect(res.status).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(400)
    })

    it("tests the createNewForm function", async ()=>{
        
        const transactionSpy = jest.spyOn( helpers , "groupChatTransaction")
        const clientSpy = jest.spyOn(helpers, "clientMaker")

        await createNewForm(req, res)

        expect(res.json).toHaveBeenCalledWith({error : "failed to create a new group"})
        expect(transactionSpy).toHaveBeenCalledTimes(1)
        expect(clientSpy).toHaveBeenCalledTimes(1)
        expect(res.status).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(400)
    })
    
    it("tests the getGroupChats function", async ()=>{

        await getGroupChats(req, res)

        expect(res.json).toHaveBeenCalledWith({ error : "cannot get the group chats list"})
        expect(res.status).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.status).toHaveBeenCalledWith(400)
    })

    it("tests the getGroupChatFunction function failure", async()=>{

        await getGroupChatData(req, res)

        expect(res.json).toHaveBeenCalledWith({ error : "failed to get the group chat data"})
        expect(res.status).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(400)
    })

    it("tests the updateGroupChatData and Image functions", async ()=>{

        await saveGroupChatImage(req, res)

        expect(res.json).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith({error : "failed to update the group chat"})
        expect(res.status).toHaveBeenCalledWith(400)

        await updateGroupChatData(req, res)

        expect(res.json).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith({error : "failed to update the group chat"})
        expect(res.status).toHaveBeenCalledWith(400)

    })

    it("tests the delete message and deletePreviousImage function", async ()=>{

        await deleteMessage(req, res)

        expect(res.json).toHaveBeenCalledWith({error : "failed to delete the message"})
        expect(res.status).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(400)

        deletePrevProfilePicture(req, res)

        expect(res.json).toHaveBeenCalledWith({ error : "some error occured"})
        expect(res.status).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(400)
    })
})