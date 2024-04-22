import api, { loggedInUserAccessToken } from "../../jest.setup"

describe('tests the /get-friend-data route', () => { 
    it("should get the friends of the user", async ()=>{
        const result = await api.get("/user/get-friends-data").set("Authorization", loggedInUserAccessToken)
        expect(result.status).toBe(200)
        expect(result.body).toEqual(expect.any(Object))
        expect(result.body[0]).toEqual(expect.objectContaining({
            fullName : expect.any(String)
        }))
    })
})