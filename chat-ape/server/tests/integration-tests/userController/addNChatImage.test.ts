import api, { loggedInUserAccessToken } from "../../jest.setup"

    it("tests the /add-chat-image route", async ()=>{

        const result = await api.post("/user/add-chat-image").set("Authorization", loggedInUserAccessToken)
            .send({
                collectionId : "bc8c0ee9-a591-4def-b1ac-192fdcba6027",
                image : "testFile"  
            })

        expect(result.status).toBe(200)
        expect(result.body).toHaveProperty("filename", expect.any(String))
        
    })


    it(`tests the get-chat-image route`, async ()=>{
        const result = await api.get(`/user/get-chat-image/${"image-1711029108628637763470.jpg"}`)
            .set("Authorization", loggedInUserAccessToken)
        
        expect(result.status).toBe(200)
        expect(result.body.toString()).toEqual(expect.any(String))
    })

    it(`tests the get-profile-picture route`, async ()=>{
        const result = await api.get(`/user/get-profile-picture/${"image-1707832479957193746767.jpg"}`)
            .set("Authorization", loggedInUserAccessToken)
        
        expect(result.status).toBe(200)
        expect(result.body.toString()).toEqual(expect.any(String))
    })
    
    it("tests teh /group-picture/:name route", async ()=>{

        const result = await api.get(`/user/group-picture/${"image-1710796984278681794967.jpg"}`)
            .set("Authorization", loggedInUserAccessToken)

        expect(result.status).toBe(200)
        expect(result.body.toString()).toEqual(expect.any(String))

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
