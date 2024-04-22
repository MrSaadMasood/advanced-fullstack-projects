import api, { loggedInUserAccessToken } from "../../jest.setup"

describe('test the delete message from group functionlity', () => { 

    it("remove the message from the group", async () => {

        const response = await api.delete(`/user/delete-message`)
            .set("Authorization", loggedInUserAccessToken)
            .query({
                collectionId : "f7f29bde-6ffb-47f4-bdeb-2bd5019312cf",
                type : "group",
                messageId : "f1d1b10-1930-4116-9aaa-b36ed8da79a8"
            })
        
        expect(response.status).toBe(200)
        expect(response.body).toBe("message successfully deleted")
    })

    it("negative: should fail to remove message", ()=>{
        
        expect(() => api.delete(`/user/delete-message`)
            .set("Authorization", loggedInUserAccessToken)
            .query({
                collectionId : "randomGroupChatsCollection",
                type : "group",
                messageId : "5083ddc1-0efb-429c-97c0-d8723b09addb"
            })).rejects.toThrow()
    })
 })