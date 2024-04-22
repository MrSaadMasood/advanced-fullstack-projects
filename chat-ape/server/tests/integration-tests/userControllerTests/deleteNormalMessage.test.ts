import api, { loggedInUserAccessToken } from "../../jest.setup"

describe('test the message deletion from normal chats', () => { 
    it("should remove the message from the normal chat", async () => {

        const response = await api.delete(`/user/delete-message`)
            .set("Authorization", loggedInUserAccessToken)
            .query({
                collectionId : "bc8c0ee9-a591-4def-b1ac-192fdcba6027",
                type : "normal",
                messageId : "5083ddc1-0efb-429c-97c0-d8723b09addb"
            })
        
        expect(response.status).toBe(200)
        expect(response.body).toBe("message successfully deleted")
    })

    it("negative : should fail to remove message from normal chats", ()=>{

        expect(() => api.delete(`/user/delete-message`)
            .set("Authorization", loggedInUserAccessToken)
            .query({
                collectionId : "randomNormalChatsCollection",
                type : "normal",
                messageId : "5083ddc1-0efb-429c-97c0-d8723b09addb"
            })).rejects.toThrow()
    })

 })