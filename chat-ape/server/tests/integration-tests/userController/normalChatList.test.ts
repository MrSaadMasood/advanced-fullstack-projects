import api, { loggedInUserAccessToken } from "../../jest.setup"

    it("tests the /get-chatlist route", async ()=>{

        const result = await api.get(`/user/get-chatlist`).set("Authorization", loggedInUserAccessToken)

        expect(result.status).toBe(200)
        expect(result.body[0]).toEqual(expect.objectContaining({
            lastMessage : expect.any(Object),
            friendData : expect.any(Object)
        }))
    })