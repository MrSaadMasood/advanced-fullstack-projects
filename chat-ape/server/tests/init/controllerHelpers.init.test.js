const { 
    sendingRequestsTransaction, 
    addFriendTransaction, 
    removeFollowRequestTransaction, 
    removeFriendTransaction, 
    updateChatMessageTransaction, 
    groupChatTransaction, 
    getCustomData,
    updateGroupChat,
    deleteMessageFromChat,
    convertStringArrayToObjectIdsArray
} = require("../../controllers/controllerHelpers")

const { client, database , errorClient, errorDatabase} = require("../testUtils")
jest.mock("mongodb", ()=>{
    const originalModule = jest.requireActual
    return {
        ...originalModule,
        ObjectId : jest.fn(()=> "string")
    }
})


afterEach(()=> jest.clearAllMocks())

describe("testing the controller helper function", ()=>{

    it("tests the sendingRequestTransaction and removeFollowRequestTransaction", async ()=>{
        const result = await sendingRequestsTransaction(client, "sender", "receiver")
        expect(result).toBe(true)
        expect(result).toBeTruthy()

        const conclusion = await removeFollowRequestTransaction(client, "user", "friend")
        
        expect(conclusion).toBe(true)
        expect(conclusion).toBeTruthy()
    })

    it("tests the addFriendTransaction and removeFriendTransaction", async ()=>{
        const result = await addFriendTransaction(client, "user", "friend")

        expect(result).toBe(true)
        expect(result).toBeTruthy()

        const conclusion = await removeFriendTransaction(client, "user", "friend")
        
        expect(conclusion).toBe(true)
        expect(conclusion).toBeTruthy()
    })

    it("tests the updateChatMessageTransaction", async ()=>{

        const result = await updateChatMessageTransaction(client , "user", "friend", "test Content", "content")

        expect(result).toBeTruthy()
        expect(result).toBeDefined()
        expect(result).not.toBeFalsy()
    })

    it("tests the groupChatTransaction function", async ()=>{

        const result = await groupChatTransaction(client, "user", [1,2,3], "testGroup", "testImage.jpg")
        expect(result).toBeTruthy()
        expect(result).toBeDefined()
        expect(result).toBe(true)
        expect(result).not.toBeFalsy()
        
    })

    it("tests the getCustomData function", async ()=>{

        const result = await getCustomData(database, "user", "normalChats")

        expect(result).toBeTruthy()
        expect(result).toBeDefined()
        expect(result).toBe(true)
        expect(result).not.toBeFalsy()

        const error = await getCustomData(errorDatabase, "user", "normalChats")

        expect(error).toBeFalsy()
        expect(error).not.toBeTruthy()
        expect(error).toBe(undefined)

    })

    it("tests the updateGroupChat function", async ()=>{

        const result = await updateGroupChat(database, "testCollection", "testUser", "content", "testContent")

        expect(result).toBeDefined()
        expect(result).toBeTruthy()
        expect(typeof result.toString()).toBe("string")

        const error = await updateGroupChat(errorDatabase, "testCollection", "testUser", "content", "testContent")
       
        expect(error).not.toBe(true)
        expect(error).toBe(false)
        expect(error).toBeFalsy()
    })

    it("tests the deleteMessageFromChat function", async ()=>{
        
        const result = await deleteMessageFromChat(database, "collection", "message", "testCollection")

        expect(result).toBeTruthy()
        expect(result).toBeDefined()
        expect(result).toBe(true)
        expect(result).not.toBeFalsy()
        
        const error = await deleteMessageFromChat(errorDatabase, "collection", "message", "testCollection")

        expect(error).not.toBe(true)
        expect(error).toBe(false)
        expect(error).toBeFalsy()
    })

    it("tests the string array to object array converted", ()=>{

        const strtingArray = JSON.stringify([ "hello", "hello", "test"])
        const result = convertStringArrayToObjectIdsArray(strtingArray, "extraMember")

        expect(typeof result).toBe("object")
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBe(4)
    })

})