import api, { loggedInUserAccessToken } from "../../jest.setup"

describe('tests /get-chat-data route', () => { 

    it("should get the chat data", async ()=>{
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

    })
    it('should fail to get the chat data', () => { 
        expect(() => api.get(`/user/get-chat/${"hexaabcdef"}`).
            set("Authorization", loggedInUserAccessToken)).rejects.toThrow()
     })
 }) 