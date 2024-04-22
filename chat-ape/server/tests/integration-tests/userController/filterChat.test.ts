import api, { loggedInUserAccessToken } from "../../jest.setup"

describe('filters the chat based on input', () => { 
    it("filters the group chat based on the date only", async ()=>{
        const date = new Date("4/20/2024")
        const response = await api.post("/user/filter-chat").set("Authorization", loggedInUserAccessToken)
            .type("form")
            .send({
                date,
                chatType : "group",
                collectionId : "f7f29bde-6ffb-47f4-bdeb-2bd5019312cf",
            })      

        console.log('the respone isDeleted', response.body)
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty("groupChatData")
        expect(response.body.groupChatData).toHaveLength(4)
        
    })

    it("filters th group chat based on the date and the member provided", async ()=>{
        const date = new Date("4/20/2024")
        const response = await api.post("/user/filter-chat").set("Authorization", loggedInUserAccessToken)
            .type("form")
            .send({
                date,
                chatType : "group",
                collectionId : "f7f29bde-6ffb-47f4-bdeb-2bd5019312cf",
                groupMemberId : "e2c9774d-9295-459c-8d9f-b06753458c94"
            })      
            
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty("groupChatData")
        expect(response.body.groupChatData).toHaveLength(1)
        
    })

    it("filters the normal chats", async ()=>{
        const date = new Date("4/20/2024")
        const response = await api.post("/user/filter-chat").set("Authorization", loggedInUserAccessToken)
            .type("form")
            .send({
                date,
                chatType : "normal",
                collectionId : "bc8c0ee9-a591-4def-b1ac-192fdcba6027",
            })      
            
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty("chat")
        expect(response.body.chat).toHaveLength(3)
    })

 })