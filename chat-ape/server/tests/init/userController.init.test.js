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
    getChatImage, 
    changeBio, 
    saveProfilePicturePath, 
    getProfilePicture, 
    getFriendsData, 
    createNewForm, 
    getGroupChats, 
    getGroupPicture, 
    getGroupChatData, 
    saveGroupChatImage, 
    updateGroupChatData, 
    deleteMessage,
    deletePrevProfilePicture,
    saveChatImagePath } = require("../../controllers/userController") 
const helpers = require("../../controllers/controllerHelpers")

jest.mock("mongodb", ()=>{
    
    const insertOne = jest.fn((value)=> ({ result : { ok : 1}}))
    const findOne = jest.fn(()=> ({
        _id : 1, 
        password : "testing", 
        email : "testing@gmail.com",
        normalChats : [
            {
                id : 1,
                friendId : "test",
                collectionId : "test"
            }
        ]
    }))
    const find = jest.fn().mockReturnThis()
    const deleteOne = jest.fn( ()=> ({ deletedCount : 1}))
    const aggregate = jest.fn().mockReturnThis()
    const updateOne = jest.fn(()=> true)
    const toArray = jest.fn().mockResolvedValue([{ id: 1}])
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
        sendingRequestsTransaction : jest.fn(()=> true),
        addFriendTransaction : jest.fn(()=> true),
        removeFriendTransaction : jest.fn(()=> true),
        removeFollowRequestTransaction : jest.fn(()=> true),
        updateChatMessageTransaction : jest.fn(()=>true),       
        groupChatTransaction : jest.fn(()=>true),
        getCustomData : jest.fn(()=> [{ id : 1 }]),
        updateGroupChat : jest.fn(()=> "string"),
        deleteMessageFromChat : jest.fn(()=> true),
        convertStringArrayToObjectIdsArray : jest.fn(()=> [1,2])
    }
})

jest.mock("path", ()=>{
    const originalModule = jest.requireActual("path")
    return {
        ...originalModule,
        join : jest.fn(()=> "string")
    }
})

jest.mock("fs", ()=>{
    const originalModule = jest.requireActual("fs")
    return {
        ...originalModule,
        unlink : jest.fn((string, callback)=> callback(null))
    }
})

afterEach(()=> jest.clearAllMocks() )

describe("test the userControllers", ()=>{
    
    it("tests the getUpdatedData function", async ()=>{
        
        await getUpdatedData(req, res)
        
        expect(res.status).not.toHaveBeenCalled()
        expect(res.json).toHaveBeenCalled()
        expect(res.status).not.toHaveBeenCalledWith(400)
    })

    it("tests the getUsersData function ", async ()=>{

        await getUsersData( {} , res )
        expect(res.status).not.toHaveBeenCalled()
        expect(res.json).toHaveBeenCalled()
    })

    it("tests the sendFollowRequest", async ()=>{
        const transactionSpy = jest.spyOn( helpers , "sendingRequestsTransaction")
        const clientSpy = jest.spyOn(helpers, "clientMaker")

        await sendFollowRequest(req, res)
        
        expect(res.status).not.toHaveBeenCalled()
        expect(transactionSpy).toHaveBeenCalledTimes(1)
        expect(clientSpy).toHaveBeenCalledTimes(1)
        expect(res.json).toHaveBeenCalled()
    })

    it("tests the getFriendsUser", async ()=>{
        const spiedFunction = jest.spyOn(helpers , "getCustomData")
        await getFriends(req, res)

        expect(spiedFunction).toHaveBeenCalledTimes(1)
        expect(res.json).toHaveBeenCalled()
        expect(res.status).not.toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith({ friends : [{ id : 1}]})
    })

    it("tests the getFollowRequests", async ()=>{
        await getFollowRequests(req, res)

        expect(res.json).toHaveBeenCalled()
        expect(res.status).not.toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith({  receivedRequests : [{ id : 1}]})
    })
    
    it("tests the addFriend function", async ()=>{
        const transactionSpy = jest.spyOn( helpers , "addFriendTransaction")
        const clientSpy = jest.spyOn(helpers, "clientMaker")

        await addFriend(req, res)
        
        expect(res.status).not.toHaveBeenCalled()
        expect(transactionSpy).toHaveBeenCalledTimes(1)
        expect(clientSpy).toHaveBeenCalledTimes(1)
        expect(res.json).toHaveBeenCalledWith({message : "successfully added friend"})
    })

    it("tests the removeFriend function", async ()=>{
        const transactionSpy = jest.spyOn( helpers , "removeFriendTransaction")
        const clientSpy = jest.spyOn(helpers, "clientMaker")

        await removeFriend(req, res)
        
        expect(res.status).not.toHaveBeenCalled()
        expect(transactionSpy).toHaveBeenCalledTimes(1)
        expect(clientSpy).toHaveBeenCalledTimes(1)
        expect(res.json).toHaveBeenCalledWith({message : "successfully removed friend"})
    })

    it("tests the  removeFollowRequest function", async ()=>{
        const transactionSpy = jest.spyOn( helpers , "removeFollowRequestTransaction")
        const clientSpy = jest.spyOn(helpers, "clientMaker")

        await removeFollowRequest(req, res)
        
        expect(res.status).not.toHaveBeenCalled()
        expect(transactionSpy).toHaveBeenCalledTimes(1)
        expect(clientSpy).toHaveBeenCalledTimes(1)
        expect(res.json).toHaveBeenCalledWith({message : "successfully removed follow request"})
        })

    it("tests the  updateChatData function", async ()=>{
        const transactionSpy = jest.spyOn( helpers , "updateChatMessageTransaction")
        const clientSpy = jest.spyOn(helpers, "clientMaker")

        await updateChatData(req, res)
        
        expect(res.status).not.toHaveBeenCalled()
        expect(transactionSpy).toHaveBeenCalledTimes(1)
        expect(clientSpy).toHaveBeenCalledTimes(1)
        expect(res.json).toHaveBeenCalledWith({ id : true })

        await saveChatImagePath(req, res)

        expect(res.status).not.toHaveBeenCalled()
        expect(transactionSpy).toHaveBeenCalledTimes(2)
        expect(clientSpy).toHaveBeenCalledTimes(2)
        expect(res.json).toHaveBeenCalledWith({ filename : req.file.filename ,id : true })
        })

    it("tests the getChatData function", async ()=>{

        await getChatData(req, res)

        expect(res.status).not.toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith( { chatData : {
            _id : 1, 
            password : "testing", 
            email : "testing@gmail.com",
            normalChats : [
                {
                    id : 1,
                    friendId : "test",
                    collectionId : "test"
                }
            ]           
        }})
    })

    it("tests the getChatList function", async ()=>{
        
        await getChatList(req, res)

        expect(res.status).not.toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith({ chatList : [ {id : 1 } ]})
    })

    it("tests the  saveChatImage function", async ()=>{
        const transactionSpy = jest.spyOn( helpers , "updateChatMessageTransaction")
        const clientSpy = jest.spyOn(helpers, "clientMaker")

        await updateChatData(req, res)
        
        expect(res.status).not.toHaveBeenCalled()
        expect(transactionSpy).toHaveBeenCalledTimes(1)
        expect(clientSpy).toHaveBeenCalledTimes(1)
        expect(res.json).toHaveBeenCalledWith({ id : true })
        })
    
    it("tests the getChatImage and getGroupPicture function", ()=>{
        getChatImage(req, res)
        getGroupPicture(req, res)

        expect(res.json).not.toHaveBeenCalled()
        expect(res.status).not.toHaveBeenCalled()
        expect(res.sendFile).toHaveBeenCalledWith("string")
    })

    it("tests the ChangeBio function", async ()=>{

        await changeBio(req, res)

        expect(res.json).toHaveBeenCalledWith({message : "the bio has been successfullly added"})
        expect(res.status).not.toHaveBeenCalled()
    })
    
    it("tests the saveProfilePicturePath function", async ()=>{

        await saveProfilePicturePath(req, res)

        expect(res.json).toHaveBeenCalledWith({ message : "profile picture successfully added"})
        expect(res.status).not.toHaveBeenCalled()
    })

    it("tests the getProfilePicture function ", ()=>{

        getProfilePicture(req, res)

        expect(res.json).not.toHaveBeenCalled()
        expect(res.status).not.toHaveBeenCalled()
        expect(res.sendFile).toHaveBeenCalledWith("string")
        
    })

    it("tests the getFriendData function", async ()=>{

        await getFriendsData(req, res)

        expect(res.json).toHaveBeenCalledWith({ friendsData : [ { id : 1 }]})
        expect(res.status).not.toHaveBeenCalled()
    })

    it("tests the createNewForm function", async ()=>{
        
        const transactionSpy = jest.spyOn( helpers , "groupChatTransaction")
        const clientSpy = jest.spyOn(helpers, "clientMaker")

        await createNewForm(req, res)

        expect(res.json).toHaveBeenCalledWith({ message : "the group is successfully created"})
        expect(transactionSpy).toHaveBeenCalledTimes(1)
        expect(clientSpy).toHaveBeenCalledTimes(1)
        expect(res.status).not.toHaveBeenCalled()
    })
    
    it("tests the getGroupChats function", async ()=>{

        await getGroupChats(req, res)

        expect(res.json).toHaveBeenCalledWith({ groupChats : [ { id : 1 }]})
        expect(res.status).not.toHaveBeenCalled()

        await getGroupChatData(req, res)

        expect(res.json).toHaveBeenCalledWith({ groupChatData : [ { id : 1 }]})
        expect(res.status).not.toHaveBeenCalled()

    })

    it("tests the updateGroupChatData and Image functions", async ()=>{

        await saveGroupChatImage(req, res)

        expect(res.json).toHaveBeenCalled()
        expect(res.status).not.toHaveBeenCalled()

        await updateGroupChatData(req, res)

        expect(res.json).toHaveBeenCalled()
        expect(res.status).not.toHaveBeenCalled()
    })

    it("tests the delete message and deletePreviousImage function", async ()=>{

        await deleteMessage(req, res)

        expect(res.json).toHaveBeenCalledWith({ message : "successfully deleted the message"})
        expect(res.status).not.toHaveBeenCalled()

        deletePrevProfilePicture(req, res)

        expect(res.json).toHaveBeenCalledWith({ message : "picture successully deleted"})
        expect(res.status).not.toHaveBeenCalled()
    })

    // testing the helperfunctions
})