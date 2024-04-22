import api, { loggedInUserAccessToken } from "../../jest.setup"

describe('tests the /group-chats list route', () => {
    it("should get the group chat list", async ()=>{
        const result = await api.get("/user/group-chats").set("Authorization", loggedInUserAccessToken)
        expect(result.status).toBe(200)
        expect(result.body).toEqual(expect.any(Object))
        expect(result.body[0]).toEqual(expect.objectContaining({
            groupName : expect.any(String),
            senderName : expect.any(String)
        }))

    })
 })    