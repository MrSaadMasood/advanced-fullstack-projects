import api, { loggedInUserAccessToken } from "../../jest.setup"

    
    it("tests the /get-chat route", async ()=>{
        const result = await api.get(`/user/get-chat/${"bc8c0ee9-a591-4def-b1ac-192fdcba6027"}`)
            .set("Authorization", loggedInUserAccessToken)

        expect(result.status).toBe(200)
        expect(result.body).toEqual(expect.objectContaining({
            _id : expect.any(String),
            chat : expect.any(Object)
        }))
        expect(result.body.chat[0]).toEqual(expect.objectContaining({
            id : expect.any(String),
            userId : expect.any(String),
        }))

        
        expect(() => api.get(`/user/get-chat/${"hexaabcdef"}`).
            set("Authorization", loggedInUserAccessToken)).rejects.toThrow()
    })
