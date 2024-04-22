import api, { loggedInUserAccessToken } from "../../jest.setup"

describe('tests the /get-group-chat route', () => { 
    it("should get the group chat data", async ()=>{
        const result = await api.get(`/user/get-group-chat/${"f7f29bde-6ffb-47f4-bdeb-2bd5019312cf"}`)
            .set("Authorization" , loggedInUserAccessToken)
    
        expect(result.status).toBe(200)
        expect(result.body).toEqual(expect.any(Object))
        expect(result.body[0]).toEqual(expect.objectContaining({
            senderName : expect.any(String),
            chat : expect.any(Object)
        }))

    })
})