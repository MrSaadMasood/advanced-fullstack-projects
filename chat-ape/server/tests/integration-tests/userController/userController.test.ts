import api from '../../jest.setup';
import { dbConnection, dbDisconnect } from '../../testUtils'

// const database = await dataBaseConnectionMaker(process.env.URI)
// const client = clientMaker(process.env.URI) 

describe("tests the /user routes", ()=>{
    let token : string;

    beforeAll(async()=>{
        await dbConnection()
        const response = await api.post("/auth-user/login").type("form").send({
            email : "saad@gmail.com",
            password : "Saad.Masood1122"
        })
        token = `Bearer ${response.body.accessToken}`
    })

    afterAll(async ()=> await dbDisconnect())

    it("tests the /update-data route", async ()=>{
        const result = await api.get("/user/updated-data").set("Authorization", token)

        expect(result.status).toBe(200)
        expect(result.body).toEqual(expect.objectContaining({ 
            fullName : "saad",
            email : "saad@gmail.com"
        }))

        
        const error = await api.get("/user/update-data").set("Authorization", `Bearer randomtoken123`)

        expect(error.status).toBe(401)
        expect(error.body).toEqual({ error : "failed to authenticate user"})
    })
    
    it("tests the /get-users route", async ()=>{
        const result = await api.get("/user/get-users").set("Authorization", token)
        console.log("the result.body is", result.body);
        
        expect(result.status).toBe(200)
        expect(result.body.length).toBeGreaterThanOrEqual(0)
        expect(result.body[0]).toEqual(expect.objectContaining({
            fullName : expect.any(String)
        }))

    })

    it("tests the /send-request route", async ()=>{
        const result = await api.post("/user/send-request").set("Authorization", token)
            .send({ receiverId : "1914f89e-aca2-4f6a-92c6-e8cb59e62935"})

        expect(result.status).toBe(200)
        expect(result.body).toEqual({message : "request successfully sent"})

    })

    // it("tests the /get-friends route", async ()=>{
    //     const result = await api.get("/user/get-friends").set("Authorization", token)

    //     expect(result.status).toBe(200)
    //     expect(result.body).toHaveProperty("friends", expect.any(Object))
    //     expect(result.body.friends.length).toBeGreaterThanOrEqual(0)
    //     expect(result.body.friends[0]).toEqual(expect.objectContaining({
    //         fullName : expect.any(String)
    //     }))

    // })

    // it("tests the /follow-requests route", async ()=>{
    //     const result = await api.get("/user/follow-requests").set("Authorization", token)

    //     expect(result.status).toBe(200)
    //     expect(result.body).toHaveProperty("receivedRequests", expect.any(Object))
    //     expect(result.body.receivedRequests.length).toBeGreaterThanOrEqual(0)
    //     expect(result.body.receivedRequests[0]).toEqual(expect.objectContaining({
    //         fullName : expect.any(String)
    //     }))

    // })

    // it("tests the /add-friend route", async ()=>{

    //     const result = await api.post("/user/add-friend").set("Authorization", token).send({ 
    //         friendId : "65cdd4eaebdddbc2ddf377c4"
    //     })

    //     expect(result.status).toBe(200)
    //     expect(result.body).toEqual({message : "successfully added friend"})

    //     const error = await api.post("/user/add-friend").set("Authorization", token).send({ 
    //         friendId : "hexaacbdef"
    //     })

    //     expect(error.status).toBe(400)
    //     expect(error.body).toEqual({ error : "failed to add friend"})
    // })
    
    // it("tests the /delete-friend route", async ()=>{

    //     const result = await api.delete(`/user/remove-friend/${"65bcc471e30a163b04040db1"}`).set("Authorization", token)

    //     expect(result.status).toBe(200)
    //     expect(result.body).toEqual({message : "successfully removed friend"})

    //     const error = await api.delete(`/user/remove-friend/${"hexaabcdef"}`).set("Authorization", token)

    //     expect(error.status).toBe(400)
    //     expect(error.body).toEqual({ error : "failed to remove friend"})
    // })

    // it("tests the /remove-follow-request route", async ()=>{

    //     const result = await api.delete(`/user/remove-follow-request/${"65cdd4eaebdddbc2ddf377c4"}`).set("Authorization", token)

    //     expect(result.status).toBe(200)
    //     expect(result.body).toEqual({message : "successfully removed follow request"})

    //     const error = await api.delete(`/user/remove-follow-request/${"hexaabcdef"}`).set("Authorization", token)

    //     expect(error.status).toBe(400)
    //     expect(error.body).toEqual({ error : "failed to remove follow request"})
    // })

    // it("tests the /get-chat route", async ()=>{
    //     const result = await api.get(`/user/get-chat/${"65bcc471e30a163b04040db1"}`).set("Authorization", token)

    //     expect(result.status).toBe(200)
    //     expect(result.body.chatData).toHaveProperty("chat", expect.any(Object))
    //     expect(result.body.chatData.chat[0]).toEqual(expect.objectContaining({
    //         id : expect.any(String),
    //         userId : expect.any(String),
    //     }))

        
    //     const error = await api.get(`/user/get-chat/${"hexaabcdef"}`).set("Authorization", token)

    //     expect(error.status).toBe(400)
    //     expect(error.body).toEqual({ error : "could not collect chat data"})
    // })

    // it("tests the /chat-data route", async ()=>{

    //     const result = await api.post(`/user/chat-data`).set("Authorization", token)
    //         .type("form").send({ 
    //             friendId : "65bcc471e30a163b04040db1", content : "testContent"
    //         })
        
    //     expect(result.status).toBe(200)
    //     expect(result.body).toHaveProperty("id", expect.any(String))

    //     const error = await api.post(`/user/chat-data`).set("Authorization", token)
    //         .type("form").send({ 
    //             friendId : "hexaabcd", content : "testContent"
    //         })
        
    //     expect(error.status).toBe(400)
    //     expect(error.body).toEqual({ error : "failed to add chat"})
            
    // })

    // it("tests the /get-chatlist route", async ()=>{

    //     const result = await api.get(`/user/get-chatlist`).set("Authorization", token)

    //     expect(result.status).toBe(200)
    //     expect(result.body).toHaveProperty("chatList", expect.any(Object))
    //     expect(result.body.chatList[0]).toEqual(expect.objectContaining({
    //         lastMessage : expect.any(Object)
    //     }))
    // })

    // it("tests the /add-chat-image route", async ()=>{

    //     const result = await api.post("/user/add-chat-image").set("Authorization", token)
    //         .set("Content-Type", "multipart/form-data")
    //         .attach("image", "D:/Programming/fullStack/full-stack-projects/messaging-app/backend/uploads/chat-images/image-1709035426809242559956.jpg" )
    //         .field("friendId", "65bcc471e30a163b04040db1" )

    //     expect(result.status).toBe(200)
    //     expect(result.body).toHaveProperty("filename", expect.any(String))
        
    // })

    // it(`tests the get-chat-image route`, async ()=>{
    //     const result = await api.get(`/user/get-chat-image/${"image-1709035426809242559956.jpg"}`)
    //         .set("Authorization", token)
        
    //     expect(result.status).toBe(200)
    //     expect(result.body.toString()).toEqual(expect.any(String))
    // })

    // it("tests the add-profile-image route", async ()=>{
        
    //     const result = await api.post("/user/add-profile-image").set("Authorization", token)
    //         .set("Content-Type", "multipart/form-data")
    //         .attach("image", "D:/Programming/fullStack/full-stack-projects/messaging-app/backend/uploads/chat-images/image-1709035426809242559956.jpg" )

    //     expect(result.status).toBe(200)
    //     expect(result.body).toEqual({ message : "profile picture successfully added"})
        
    // })
    
    // it(`tests the get-profile-picture route`, async ()=>{
    //     const result = await api.get(`/user/get-profile-picture/${"image-1708026988991581479363.jpg"}`)
    //         .set("Authorization", token)
        
    //     expect(result.status).toBe(200)
    //     expect(result.body.toString()).toEqual(expect.any(String))
    // })

    // it("tests the change-bio", async ()=>{
        
    //     const result = await api.post("/user/change-bio").set("Authorization", token).type("form")
    //         .send({bio : "testBio"})

    //     expect(result.status).toBe(200)
    //     expect(result.body).toEqual({message : "the bio has been successfullly added"})
    // })

    // it("tests the /get-friend-data route", async ()=>{

    //     const result = await api.get("/user/get-friends-data").set("Authorization", token)

    //     expect(result.status).toBe(200)
    //     expect(result.body).toHaveProperty("friendsData", expect.any(Object))
    //     expect(result.body.friendsData[0]).toEqual(expect.objectContaining({
    //         fullName : expect.any(String)
    //     }))
    // })

    // it("tests the create-new-group route", async ()=>{

    //     const result = await api.post("/user/create-new-group").set("Authorization", token)
    //         .set("Content-Type", "multipart/form-data")
    //         .field("members", JSON.stringify(["65bbb207c05731ef6b25ad19", "65bcc471e30a163b04040db1"]))
    //         .field("groupName", "testGroup")
        
        
    //     expect(result.status).toBe(200)
    //     expect(result.body).toEqual({ message : "the group is successfully created"})

    // })

    // it("tests the /group-chats", async ()=>{

    //     const result = await api.get("/user/group-chats").set("Authorization", token)
    //     expect(result.status).toBe(200)
    //     expect(result.body).toHaveProperty("groupChats", expect.any(Object))
    //     expect(result.body.groupChats[0]).toEqual(expect.objectContaining({
    //         groupName : expect.any(String),
    //         senderName : expect.any(String)
    //     }))

    // })
    
    // it("tests teh /group-picture/:name route", async ()=>{

    //     const result = await api.get(`/user/group-picture/${"image-1708028116229864709855.jpg"}`)
    //         .set("Authorization", token)

    //     expect(result.status).toBe(200)
    //     expect(result.body.toString()).toEqual(expect.any(String))

    // })

    // it("tests the /get-group-chat route", async ()=>{
         
    //     const result = await api.get(`/user/get-group-chat/${"65ce707d1673e9ea756f0703"}`)
    //         .set("Authorization" , token)
    
    //     expect(result.status).toBe(200)
    //     expect(result.body).toHaveProperty("groupChatData", expect.any(Object))
    //     expect(result.body.groupChatData[0]).toEqual(expect.objectContaining({
    //         senderName : expect.any(String)
    //     }))

    // })

    // it("tests the /add-group-chat-image route", async ()=>{

    //     const result = await api.post("/user/add-group-chat-image").set("Authorization", token)
    //         .set("Content-Type", "multipart/form-data")
    //         .field("groupId", "65ce707d1673e9ea756f0703")
    //         .attach("image", "D:/Programming/fullStack/full-stack-projects/messaging-app/backend/uploads/chat-images/image-1709035426809242559956.jpg")
        
    //     expect(result.status).toBe(200)
    //     expect(result.body).toHaveProperty("filename", expect.any(String))
    // })

    // it("tests the group-data route", async ()=>{

    //     const result = await api.post("/user/group-data").set("Authorization", token)
    //         .type("form")
    //         .send({
    //             groupId : "65ce707d1673e9ea756f0703",
    //             content : "test content"
    //         })

    //     expect(result.status).toBe(200)
    //     expect(result.body.toString()).toEqual(expect.any(String))

    //     const error = await api.post("/user/group-data").set("Authorization", token)
    //         .type("form")
    //         .send({
    //             groupId : "randomgorup1234",
    //             content : "test content"
    //         })
        
    //     expect(error.status).toBe(400)
    //     expect(error.body).toEqual({error : "failed to update the group chat"})
    // })

    // it("test the /delete-message route", async ()=>{

    //     const result = await api.delete("/user/delete-message").set("Authorization", token)
    //         .query({
    //             data : JSON.stringify({
    //                 collectionId : "65ce707d1673e9ea756f0703",
    //                 type : "groupChats",
    //                 messageId : "65ce707d1673e9ea756f0704"
    //             })
    //         })

    //     expect(result.status).toBe(200)
    //     expect(result.body).toEqual({ message : "successfully deleted the message"})

    //     const result2 = await api.delete("/user/delete-message").set("Authorization", token)
    //         .query({
    //             data : JSON.stringify({
    //                 collectionId : "65ce6e271673e9ea756f06ff",
    //                 type : "normalChats",
    //                 messageId : "65ce6e241673e9ea756f06fe"
    //             })
    //         })
        
    //     expect(result2.status).toBe(200)
    //     expect(result2.body).toEqual({ message : "successfully deleted the message"})

    //     const error = await api.delete("/user/delete-message").set("Authorization", token)
    //         .query({
    //             data : JSON.stringify({
    //                 collectionId : "randomid1234",
    //                 type : "normalChats",
    //                 messageId : "randomid1234"
    //             })
    //         })
        
    //     expect(error.status).toBe(400)
    //     expect(error.body).toEqual({error : "failed to delete the message"})
        
    // })

})