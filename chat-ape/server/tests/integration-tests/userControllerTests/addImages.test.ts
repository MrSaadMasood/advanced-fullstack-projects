import api, { loggedInUserAccessToken } from "../../jest.setup"

describe('test the adding the images to chats', () => { 

    it("tests the /add-chat-image route", async ()=>{

        const result = await api.post("/user/add-chat-image").set("Authorization", loggedInUserAccessToken)
            .send({
                collectionId : "bc8c0ee9-a591-4def-b1ac-192fdcba6027",
                image : "testFile"  
            })

        expect(result.status).toBe(200)
        expect(result.body).toHaveProperty("filename", expect.any(String))
        
    })

    it("tests the /add-group-chat-image route", async ()=>{

        const result = await api.post("/user/add-group-chat-image").set("Authorization", loggedInUserAccessToken)
            .type("form")
            .send({
                groupId : "f7f29bde-6ffb-47f4-bdeb-2bd5019312cf",
                image : "testImage"
            })
        
        expect(result.status).toBe(200)
        expect(result.body).toHaveProperty("filename", expect.any(String))
            
        expect(() => api.post("/user/add-group-chat-image").set("Authorization", loggedInUserAccessToken)
            .type("form")
            .send({
                groupId : "f7f29bde-6ffb-47f4-bdeb-2bd5019312cf",
            })).rejects.toThrow()
    })
})

 
